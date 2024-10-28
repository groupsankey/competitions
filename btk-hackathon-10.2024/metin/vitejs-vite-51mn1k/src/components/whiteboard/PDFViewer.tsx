import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, FileUp, RotateCw, Hand } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, onFileUpload, fileInputRef }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const [isHandTool, setIsHandTool] = useState(false);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isHandTool && e.button === 0) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX + containerRef.current!.scrollLeft,
        y: e.clientY + containerRef.current!.scrollTop
      });
      e.preventDefault();
    } else if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - scrollPos.x,
        y: e.clientY - scrollPos.y
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    if (isHandTool) {
      const newX = startPos.x - e.clientX;
      const newY = startPos.y - e.clientY;
      
      if (containerRef.current) {
        containerRef.current.scrollLeft = newX;
        containerRef.current.scrollTop = newY;
      }
    } else {
      const newX = e.clientX - startPos.x;
      const newY = e.clientY - startPos.y;

      if (containerRef.current) {
        containerRef.current.scrollLeft = -newX;
        containerRef.current.scrollTop = -newY;
        setScrollPos({ x: -newX, y: -newY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      handleZoom(delta);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel as any, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel as any);
      }
    };
  }, []);

  if (!pdfUrl) return null;

  return (
    <div className="absolute inset-0 w-full h-full bg-gray-100" style={{ zIndex: 10 }}>
      <div
        ref={containerRef}
        className="w-full h-full overflow-auto"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isHandTool 
            ? isDragging ? 'grabbing' : 'grab'
            : 'default'
        }}
      >
        <div 
          style={{ 
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'top left',
            transition: 'transform 0.2s ease-in-out',
          }}
        >
          <embed
            src={`${pdfUrl}#toolbar=0`}
            type="application/pdf"
            className="w-full min-h-screen"
            style={{ 
              pointerEvents: 'none',
              backgroundColor: 'white'
            }}
          />
        </div>
      </div>
      <div className="fixed top-20 right-4 flex gap-2 bg-white p-2 rounded-lg shadow-md z-50">
        <button
          onClick={() => handleZoom(0.1)}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Zoom In (Ctrl + Mouse Wheel)"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleZoom(-0.1)}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Zoom Out (Ctrl + Mouse Wheel)"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button
          onClick={handleRotate}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Rotate"
        >
          <RotateCw className="h-5 w-5" />
        </button>
        <button
          onClick={() => setIsHandTool(!isHandTool)}
          className={`p-2 rounded-lg hover:bg-gray-100 ${isHandTool ? 'bg-indigo-100 text-indigo-600' : ''}`}
          title="Hand Tool (Click and drag to pan)"
        >
          <Hand className="h-5 w-5" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Upload PDF"
        >
          <FileUp className="h-5 w-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="application/pdf"
          onChange={onFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default PDFViewer;