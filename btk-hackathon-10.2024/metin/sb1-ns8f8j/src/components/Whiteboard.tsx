import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

const Whiteboard = ({ user }) => {
  const socket = io('http://localhost:4000'); // Specify the server URL
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const colorPickerRef = React.useRef<HTMLInputElement | null>(null);
  const brushSizeRef = React.useRef<HTMLInputElement | null>(null);
  const clearBtnRef = React.useRef<HTMLButtonElement | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const draw = (e: MouseEvent) => {
      if (!isDrawing || !ctx) return; // Allow drawing for both teachers and students
      const rect = canvas?.getBoundingClientRect();
      const x = e.clientX - (rect?.left || 0);
      const y = e.clientY - (rect?.top || 0);

      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = colorPickerRef.current?.value || '#000000';
      ctx.lineWidth = parseInt(brushSizeRef.current?.value || '5', 10);

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Emit drawing data to the server
      socket.emit('draw', {
        x0: lastX,
        y0: lastY,
        x1: x,
        y1: y,
        color: ctx.strokeStyle,
        size: ctx.lineWidth
      });

      [lastX, lastY] = [x, y];
    };

    if (canvas) {
      canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        [lastX, lastY] = [e.clientX - rect.left, e.clientY - rect.top];
      });

      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', () => isDrawing = false);
      canvas.addEventListener('mouseout', () => isDrawing = false);
    }

    // Listen for drawing events from the server
    socket.on('draw', (data) => {
      if (!ctx) return;
      ctx.beginPath();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.size;
      ctx.moveTo(data.x0, data.y0);
      ctx.lineTo(data.x1, data.y1);
      ctx.stroke();
    });

    clearBtnRef.current?.addEventListener('click', () => {
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (canvas) {
        canvas.removeEventListener('mousemove', draw);
      }
    };
  }, [socket, user]);

  return (
    <div className="flex h-screen">
      <div className="flex flex-col p-4 bg-white shadow-md w-48 mt-24">
        <input type="color" ref={colorPickerRef} defaultValue="#000000" className="mb-2" />
        <input type="range" ref={brushSizeRef} min="1" max="20" defaultValue="5" className="mb-2" />
        <button ref={clearBtnRef} className="bg-red-500 text-white px-4 py-2 rounded">Clear</button>
      </div>
      <canvas ref={canvasRef} className="flex-1 bg-white cursor-crosshair" />
    </div>
  );
};

export default Whiteboard;
