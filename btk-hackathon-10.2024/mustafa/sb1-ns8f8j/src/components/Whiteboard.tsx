import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Square, Circle, Triangle, Type, Pencil, Eraser, FileUp, ZoomIn, ZoomOut, Move, ChevronUp, ChevronDown, Hand } from 'lucide-react';

type Tool = 'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'triangle' | 'move' | 'interact';
type DrawingMode = 'free' | 'shape';

interface DrawingPoint {
  x: number;
  y: number;
  color: string;
  size: number;
  type: 'draw' | 'erase';
}

const Whiteboard = ({ user }) => {
  const socket = io('http://localhost:4000');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapes, setShapes] = useState<any[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfScale, setPdfScale] = useState(1);
  const [pdfPosition, setPdfPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [drawingHistory, setDrawingHistory] = useState<DrawingPoint[]>([]);
  const lastDrawnPoint = useRef<{ x: number; y: number } | null>(null);

  const tools = [
    { id: 'pen', icon: Pencil, label: 'Pen' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
    { id: 'move', icon: Move, label: 'Move PDF' },
    { id: 'interact', icon: Hand, label: 'Interact with PDF' },
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    const resizeCanvas = () => {
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        redrawCanvas();
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    
    drawingHistory.forEach((point, index) => {
      if (index === 0 || drawingHistory[index - 1].type !== point.type) {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
      }
      
      if (point.type === 'draw') {
        ctx.strokeStyle = point.color;
        ctx.lineWidth = point.size;
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      } else if (point.type === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = point.size;
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
    });

    shapes.forEach(shape => drawShape(ctx, shape));
  };

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (selectedTool === 'move' || selectedTool === 'interact') return;

    const point = getCanvasPoint(e.clientX, e.clientY);
    setIsDrawing(true);
    setStartPos(point);
    lastDrawnPoint.current = point;

    if (selectedTool === 'pen' || selectedTool === 'eraser') {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      
      if (selectedTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
      }
      
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      setDrawingHistory(prev => [...prev, {
        x: point.x,
        y: point.y,
        color: selectedTool === 'pen' ? color : 'rgba(0,0,0,1)',
        size: brushSize,
        type: selectedTool === 'pen' ? 'draw' : 'erase'
      }]);
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || selectedTool === 'move' || selectedTool === 'interact') return;
    
    const point = getCanvasPoint(e.clientX, e.clientY);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !lastDrawnPoint.current) return;

    if (selectedTool === 'pen' || selectedTool === 'eraser') {
      if (selectedTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
      }

      ctx.beginPath();
      ctx.moveTo(lastDrawnPoint.current.x, lastDrawnPoint.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();

      socket.emit('draw', {
        type: 'free',
        x0: lastDrawnPoint.current.x / canvasRef.current!.width,
        y0: lastDrawnPoint.current.y / canvasRef.current!.height,
        x1: point.x / canvasRef.current!.width,
        y1: point.y / canvasRef.current!.height,
        tool: selectedTool,
        color: selectedTool === 'pen' ? color : 'rgba(0,0,0,1)',
        size: brushSize
      });

      setDrawingHistory(prev => [...prev, {
        x: point.x,
        y: point.y,
        color: selectedTool === 'pen' ? color : 'rgba(0,0,0,1)',
        size: brushSize,
        type: selectedTool === 'pen' ? 'draw' : 'erase'
      }]);

      lastDrawnPoint.current = point;
    } else {
      redrawCanvas();
      drawPreviewShape(ctx, point.x, point.y);
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
    if (!isDrawing || selectedTool === 'move' || selectedTool === 'interact') return;
    setIsDrawing(false);

    const point = getCanvasPoint(e.clientX, e.clientY);
    if (selectedTool !== 'pen' && selectedTool !== 'eraser') {
      const newShape = {
        type: selectedTool,
        x: startPos.x / canvasRef.current!.width,
        y: startPos.y / canvasRef.current!.height,
        width: (point.x - startPos.x) / canvasRef.current!.width,
        height: (point.y - startPos.y) / canvasRef.current!.height,
        color,
        size: brushSize
      };

      setShapes([...shapes, newShape]);
      socket.emit('draw', { ...newShape, tool: selectedTool });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setPdfPosition({ x: 0, y: 0 });
      setPdfScale(1);
      setCurrentPage(1);
      
      const tempIframe = document.createElement('iframe');
      tempIframe.src = url;
      tempIframe.style.display = 'none';
      document.body.appendChild(tempIframe);
      
      tempIframe.onload = () => {
        try {
          const doc = tempIframe.contentWindow?.document;
          const pageCount = doc?.querySelector('embed[type="application/pdf"]')?.getAttribute('data-page-count');
          if (pageCount) {
            setTotalPages(parseInt(pageCount));
          }
        } finally {
          document.body.removeChild(tempIframe);
        }
      };
    } else {
      alert('Please upload a PDF file');
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setPdfScale(prevScale => {
      const newScale = direction === 'in' ? prevScale * 1.1 : prevScale / 1.1;
      return Math.min(Math.max(0.5, newScale), 3);
    });
  };

  const handlePageChange = (direction: 'up' | 'down') => {
    setCurrentPage(prev => {
      const newPage = direction === 'up' ? prev - 1 : prev + 1;
      return Math.min(Math.max(1, newPage), totalPages);
    });
  };

  const handlePdfScroll = (e: React.WheelEvent) => {
    if (selectedTool === 'interact') {
      e.preventDefault();
      setPdfPosition(prev => ({
        x: prev.x,
        y: prev.y - e.deltaY,
      }));
    }
  };

  const handlePdfMouseDown = (e: React.MouseEvent) => {
    if ((selectedTool === 'move' || selectedTool === 'interact') && pdfUrl) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - pdfPosition.x,
        y: e.clientY - pdfPosition.y
      });
    } else {
      startDrawing(e);
    }
  };

  const handlePdfMouseMove = (e: React.MouseEvent) => {
    if (isDragging && (selectedTool === 'move' || selectedTool === 'interact')) {
      setPdfPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    } else {
      draw(e);
    }
  };

  const handlePdfMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
    } else {
      finishDrawing(e);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    setShapes([]);
    setDrawingHistory([]);
    socket.emit('clear');
  };

  useEffect(() => {
    socket.on('draw', (data) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      if (data.type === 'free') {
        ctx.beginPath();
        ctx.moveTo(data.x0 * canvas.width, data.y0 * canvas.height);
        ctx.lineTo(data.x1 * canvas.width, data.y1 * canvas.height);
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (data.tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
        } else {
          ctx.globalCompositeOperation = 'source-over';
        }
        
        ctx.stroke();
        
        if (data.tool === 'eraser') {
          ctx.globalCompositeOperation = 'source-over';
        }
      } else {
        const normalizedShape = {
          ...data,
          x: data.x * canvas.width,
          y: data.y * canvas.height,
          width: data.width * canvas.width,
          height: data.height * canvas.height
        };
        setShapes(prevShapes => [...prevShapes, normalizedShape]);
        drawShape(ctx, normalizedShape);
      }
    });

    socket.on('clear', clearCanvas);

    return () => {
      socket.off('draw');
      socket.off('clear');
    };
  }, [socket]);

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
          <h3 className="font-medium text-gray-700">PDF Controls</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleZoom('in')}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
              Zoom In
            </button>
            <button
              onClick={() => handleZoom('out')}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
              Zoom Out
            </button>
          </div>
          {pdfUrl && (
            <div className="flex items-center justify-between gap-2 mt-2">
              <button
                onClick={() => handlePageChange('up')}
                disabled={currentPage <= 1}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ChevronUp className="h-4 w-4" />
                Previous
              </button>
              <span className="text-sm text-gray-600">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={() => handlePageChange('down')}
                disabled={currentPage >= totalPages}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ChevronDown className="h-4 w-4" />
                Next
              </button>
            </div>
          )}
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

      <div 
        className="flex-1 relative overflow-hidden"
        onMouseDown={handlePdfMouseDown}
        onMouseMove={handlePdfMouseMove}
        onMouseUp={handlePdfMouseUp}
        onMouseLeave={handlePdfMouseUp}
        onWheel={handlePdfScroll}
      >
        {pdfUrl && (
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${pdfPosition.x}px, ${pdfPosition.y}px) scale(${pdfScale})`,
              transformOrigin: 'center',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              pointerEvents: selectedTool === 'interact' ? 'auto' : 'none',
            }}
          >
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#page=${currentPage}`}
              className="w-full h-full"
              style={{ 
                pointerEvents: selectedTool === 'interact' ? 'auto' : 'none',
              }}
            />
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ 
            zIndex: selectedTool === 'interact' ? 0 : 20,
            cursor: selectedTool === 'move' 
              ? 'move' 
              : selectedTool === 'interact' 
                ? 'default'
                : selectedTool === 'eraser'
                  ? 'crosshair'
                  : 'crosshair',
            pointerEvents: selectedTool === 'interact' ? 'none' : 'auto',
          }}
        />
      </div>
    </div>
  );
};

export default Whiteboard;