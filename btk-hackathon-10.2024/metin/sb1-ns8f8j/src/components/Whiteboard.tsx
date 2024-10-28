import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const Whiteboard = ({ user }) => {
  const socket = io('http://localhost:4000'); // Specify the server URL
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const colorPickerRef = useRef<HTMLInputElement | null>(null);
  const brushSizeRef = useRef<HTMLInputElement | null>(null);
  const clearBtnRef = useRef<HTMLButtonElement | null>(null);
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    const draw = (e: MouseEvent) => {
      if (!isDrawing || !ctx) return;
      const rect = canvas?.getBoundingClientRect();
      const x = e.clientX - (rect?.left || 0);
      const y = e.clientY - (rect?.top || 0);

      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = colorPickerRef.current?.value || '#000000';
      ctx.lineWidth = parseInt(brushSizeRef.current?.value || '5', 10);

      // Emit drawing data to the server with multiple points
      const points = interpolatePoints(lastX, lastY, x, y);
      points.forEach(point => {
        socket.emit('draw', {
          x0: point.x0,
          y0: point.y0,
          x1: point.x1,
          y1: point.y1,
          color: ctx.strokeStyle,
          size: ctx.lineWidth
        });
      });

      // Draw on the local canvas
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();

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

    // Function to interpolate points between two coordinates
    const interpolatePoints = (x0: number, y0: number, x1: number, y1: number) => {
      const points = [];
      const steps = 10; // Number of segments to create
      for (let i = 0; i <= steps; i++) {
        const x = x0 + (x1 - x0) * (i / steps);
        const y = y0 + (y1 - y0) * (i / steps);
        points.push({ x0, y0, x1: x, y1: y });
        x0 = x; // Update x0 for the next segment
        y0 = y; // Update y0 for the next segment
      }
      return points;
    };

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

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (canvas) {
        canvas.removeEventListener('mousemove', draw);
      }
    };
  }, [socket, user]);

  return (
    <div className="flex h-screen"> {/* Updated layout */}
      <div className="flex flex-col p-4 bg-white shadow-md w-48 mt-24"> {/* Sidebar for controls */}
        <input type="color" ref={colorPickerRef} defaultValue="#000000" className="mb-2" />
        <input type="range" ref={brushSizeRef} min="1" max="20" defaultValue="5" className="mb-2" />
        <button ref={clearBtnRef} className="bg-red-500 text-white px-4 py-2 rounded">Clear</button>
      </div>
      <canvas ref={canvasRef} className="flex-1 bg-white cursor-crosshair" /> {/* Canvas area */}
    </div>
  );
};

export default Whiteboard;
