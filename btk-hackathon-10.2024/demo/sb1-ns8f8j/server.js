import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

// Use CORS middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from this origin
  methods: ['GET', 'POST'], // Allow these HTTP methods
  credentials: true // Allow cookies to be sent
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Allow requests from this origin
    methods: ['GET', 'POST'], // Allow these HTTP methods
    credentials: true // Allow cookies to be sent
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('draw', (data) => {
    io.emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => console.log('Server is running on port 4000'));
