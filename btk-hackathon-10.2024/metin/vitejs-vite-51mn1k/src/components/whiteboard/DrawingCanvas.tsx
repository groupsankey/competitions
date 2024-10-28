import React, { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface DrawingCanvasProps {
  selectedTool: string;
  color: string;
  brushSize: number;
  socket: Socket;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ selectedTool, color, brushSize, socket }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio;

    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    context.scale(scale, scale);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;
  }, []);

  useEffect(() => {
    initializeCanvas();
    window.addEventListener('resize', initializeCanvas);
    return () => window.removeEventListener('resize', initializeCanvas);
  }, [initializeCanvas]);

  useEffect(() => {
    socket.on('draw', (data) => {
      const context = contextRef.current;
      if (!context) return;

      context.beginPath();
      context.moveTo(data.x0, data.y0);
      context.lineTo(data.x1, data.y1);
      context.strokeStyle = data.color;
      context.lineWidth = data.size;
      context.globalCompositeOperation = data.tool === 'eraser' ? 'destination-out' : 'source-over';
      context.stroke();
    });

    socket.on('clear', clearCanvas);

    return () => {
      socket.off('draw');
      socket.off('clear');
    };
  }, [socket]);

  const getPoint = (e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent) => {
    isDrawing.current = true;
    lastPoint.current = getPoint(e);

    const context = contextRef.current;
    if (!context) return;

    context.beginPath();
    context.moveTo(lastPoint.current.x, lastPoint.current.y);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing.current) return;

    const context = contextRef.current;
    if (!context) return;

    const point = getPoint(e);

    context.beginPath();
    context.moveTo(lastPoint.current.x, lastPoint.current.y);
    context.lineTo(point.x, point.y);
    
    if (selectedTool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
      context.strokeStyle = 'rgba(255, 255, 255, 1)';
    } else {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = color;
    }
    
    context.lineWidth = brushSize;
    context.stroke();

    socket.emit('draw', {
      type: 'line',
      x0: lastPoint.current.x,
      y0: lastPoint.current.y,
      x1: point.x,
      y1: point.y,
      color: context.strokeStyle,
      size: brushSize,
      tool: selectedTool
    });

    lastPoint.current = point;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    const context = contextRef.current;
    if (context) {
      context.globalCompositeOperation = 'source-over';
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear');
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-crosshair"
      style={{ zIndex: 20, touchAction: 'none' }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
};

export default DrawingCanvas;