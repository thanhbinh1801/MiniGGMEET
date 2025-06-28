import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import initSocketService from './services/socket.service.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

initSocketService(io);

server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});