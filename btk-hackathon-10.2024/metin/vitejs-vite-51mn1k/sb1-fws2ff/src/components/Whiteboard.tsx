import React, { useRef, useState } from 'react';
import { io } from 'socket.io-client';
import PDFViewer from './whiteboard/PDFViewer';
import DrawingCanvas from './whiteboard/DrawingCanvas';
import ToolBar from './whiteboard/ToolBar';

const Whiteboard = ({ user }) => {
  const socket = io('http://localhost:4000');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTool, setSelectedTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    } else {
      alert('Please upload a PDF file');
    }
  };

  return (
    <div className="flex h-screen">
      <ToolBar
        selectedTool={selectedTool}
        color={color}
        brushSize={brushSize}
        onToolSelect={setSelectedTool}
        onColorSelect={setColor}
        onBrushSizeChange={setBrushSize}
        onClear={() => socket.emit('clear')}
      />
      
      <div className="flex-1 relative overflow-hidden">
        <PDFViewer
          pdfUrl={pdfUrl}
          onFileUpload={handleFileUpload}
          fileInputRef={fileInputRef}
        />
        <DrawingCanvas
          selectedTool={selectedTool}
          color={color}
          brushSize={brushSize}
          socket={socket}
        />
      </div>
    </div>
  );
};

export default Whiteboard;