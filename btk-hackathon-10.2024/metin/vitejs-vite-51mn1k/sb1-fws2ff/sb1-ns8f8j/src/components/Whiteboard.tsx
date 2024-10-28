import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Square, Circle, Triangle, Type, Pencil, Eraser, FileUp } from 'lucide-react';

type Tool = 'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'triangle';
type DrawingMode = 'free' | 'shape';

const Whiteboard = ({ user }) => {
  const socket = io('http://localhost:4000');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapes, setShapes] = useState<any[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const tools = [
    { id: 'pen', icon: Pencil, label: 'Pen' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    } else {
      alert('Please upload a PDF file');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        redrawShapes();
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const redrawShapes = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    shapes.forEach(shape => drawShape(ctx, shape));
  };

  const drawShape = (ctx: CanvasRenderingContext2D, shape: any) => {
    ctx.beginPath();
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.size;

    switch (shape.type) {
      case 'rectangle':
        ctx.rect(shape.x, shape.y, shape.width, shape.height);
        break;
      case 'circle':
        ctx.arc(shape.x + shape.width/2, shape.y + shape.height/2, 
          Math.min(Math.abs(shape.width), Math.abs(shape.height))/2, 0, Math.PI * 2);
        break;
      case 'triangle':
        ctx.moveTo(shape.x + shape.width/2, shape.y);
        ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
        ctx.lineTo(shape.x, shape.y + shape.height);
        ctx.closePath();
        break;
    }
    ctx.stroke();
  };

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    const x = e.clientX - (rect?.left || 0);
    const y = e.clientY - (rect?.top || 0);

    setIsDrawing(true);
    setStartPos({ x, y });

    if (selectedTool === 'pen' || selectedTool === 'eraser') {
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = selectedTool === 'eraser' ? '#FFFFFF' : color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const rect = canvas?.getBoundingClientRect();
    const x = e.clientX - (rect?.left || 0);
    const y = e.clientY - (rect?.top || 0);

    if (selectedTool === 'pen' || selectedTool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();

      socket.emit('draw', {
        type: 'free',
        x0: startPos.x,
        y0: startPos.y,
        x1: x,
        y1: y,
        tool: selectedTool,
        color: selectedTool === 'eraser' ? '#FFFFFF' : color,
        size: brushSize
      });
    } else {
      redrawShapes();
      drawPreviewShape(ctx, x, y);
    }
  };

  const drawPreviewShape = (ctx: CanvasRenderingContext2D, currentX: number, currentY: number) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;

    const width = currentX - startPos.x;
    const height = currentY - startPos.y;

    switch (selectedTool) {
      case 'rectangle':
        ctx.rect(startPos.x, startPos.y, width, height);
        break;
      case 'circle':
        ctx.arc(startPos.x + width/2, startPos.y + height/2, 
          Math.min(Math.abs(width), Math.abs(height))/2, 0, Math.PI * 2);
        break;
      case 'triangle':
        ctx.moveTo(startPos.x + width/2, startPos.y);
        ctx.lineTo(startPos.x + width, startPos.y + height);
        ctx.lineTo(startPos.x, startPos.y + height);
        ctx.closePath();
        break;
    }
    ctx.stroke();
  };

  const finishDrawing = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    const endX = e.clientX - (rect?.left || 0);
    const endY = e.clientY - (rect?.top || 0);

    if (selectedTool !== 'pen' && selectedTool !== 'eraser') {
      const newShape = {
        type: selectedTool,
        x: startPos.x,
        y: startPos.y,
        width: endX - startPos.x,
        height: endY - startPos.y,
        color,
        size: brushSize
      };

      setShapes([...shapes, newShape]);
      socket.emit('draw', { ...newShape, tool: selectedTool });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    setShapes([]);
    socket.emit('clear');
  };

  useEffect(() => {
    socket.on('draw', (data) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      if (data.type === 'free') {
        ctx.beginPath();
        ctx.moveTo(data.x0, data.y0);
        ctx.lineTo(data.x1, data.y1);
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      } else {
        setShapes(prevShapes => [...prevShapes, data]);
        drawShape(ctx, data);
      }
    });

    socket.on('clear', clearCanvas);

    return () => {
      socket.off('draw');
      socket.off('clear');
    };
  }, [socket]);

  return (
    <div className="flex h-screen">
      <div className="flex flex-col p-4 bg-white shadow-md w-64 mt-16 space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">Tools</h3>
          <div className="grid grid-cols-3 gap-2">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id as Tool)}
                className={`p-2 rounded-lg flex flex-col items-center justify-center ${
                  selectedTool === tool.id ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'
                }`}
                title={tool.label}
              >
                <tool.icon className="h-6 w-6" />
                <span className="text-xs mt-1">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">Colors</h3>
          <div className="grid grid-cols-5 gap-2">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 ${
                  color === c ? 'border-gray-400' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">Brush Size</h3>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-gray-500 text-center">{brushSize}px</div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">Upload PDF</h3>
          <input
            type="file"
            ref={fileInputRef}
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FileUp className="h-4 w-4" />
            Choose PDF
          </button>
        </div>

        <button
          onClick={clearCanvas}
          className="mt-auto w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Clear Canvas
        </button>
      </div>

      <div className="flex-1 relative">
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 10 }}
          />
        )}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{ zIndex: 20 }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={finishDrawing}
          onMouseOut={finishDrawing}
        />
      </div>
    </div>
  );
};

export default Whiteboard;