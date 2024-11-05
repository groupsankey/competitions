import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  maxHttpBufferSize: 1e8 // 100 MB max file size
});

// Store PDF state
let currentPdfState = {
  pdf: null,
  scale: 1,
  position: { x: 0, y: 0 },
  page: 1
};

// Store drawing state
let drawingState = {
  shapes: [],
  history: []
};

io.on('connection', (socket) => {
  console.log('New client connected');

  // Send current states to new clients
  if (currentPdfState.pdf) {
    socket.emit('pdfUploaded', {
      url: currentPdfState.pdf,
      scale: currentPdfState.scale,
      position: currentPdfState.position,
      page: currentPdfState.page
    });
  }

  if (drawingState.shapes.length > 0 || drawingState.history.length > 0) {
    socket.emit('drawingState', drawingState);
  }

  socket.on('draw', (data) => {
    if (data.type === 'free') {
      drawingState.history.push(data);
    } else {
      drawingState.shapes.push(data);
    }
    socket.broadcast.emit('draw', data);
  });

  socket.on('pdfUpload', (data) => {
    currentPdfState = {
      pdf: data.pdf,
      scale: data.scale,
      position: data.position,
      page: data.page
    };
    socket.broadcast.emit('pdfUploaded', {
      url: data.pdf,
      scale: data.scale,
      position: data.position,
      page: data.page
    });
  });

  socket.on('pdfStateUpdate', (data) => {
    currentPdfState = {
      ...currentPdfState,
      scale: data.scale,
      position: data.position,
      page: data.page
    };
    socket.broadcast.emit('pdfStateChanged', {
      scale: data.scale,
      position: data.position,
      page: data.page
    });
  });

  socket.on('clear', () => {
    drawingState = {
      shapes: [],
      history: []
    };
    socket.broadcast.emit('clear');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => console.log('Server is running on port 4000'));