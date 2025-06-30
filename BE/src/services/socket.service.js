import RoomModel from '../models/room.models.js';

class SocketService {
  constructor(io){
    this.io = io;
    this.users = new Map();
    this.userIdToSocketId = new Map(); // Thêm map này để tra cứu nhanh
    this.registerEvents();  
  }

  registerEvents() {
    this.io.on('connection', (socket) => {
      console.log(`=== NEW SOCKET CONNECTION ===`);
      console.log(`User connected: ${socket.id}`);

      // Lưu userId <-> socketId khi user join
      socket.on('register-user', ({ uid }) => {
        this.userIdToSocketId.set(uid, socket.id);
        console.log(`User registered: ${uid} -> ${socket.id}`);
        console.log(`Total registered users: ${this.userIdToSocketId.size}`);
      });

      // Test event để kiểm tra connection
      socket.on('test-connection', (data) => {
        console.log(`=== TEST CONNECTION RECEIVED ===`);
        console.log(`From socket: ${socket.id}`);
        console.log(`Data:`, data);
        socket.emit('test-response', { message: 'Server received test', socketId: socket.id });
      });

      // Khi user muốn vào phòng
      socket.on('request-join-room', async ({ roomId, uid, name }) => {
        try {
          console.log(`=== SERVER RECEIVED JOIN REQUEST ===`);
          console.log(`User ${name} (${uid}) wants to join room ${roomId}`);
          console.log(`Socket ID: ${socket.id}`);
          
          // Tìm hostUid của phòng
          const room = await RoomModel.findOne({ roomId });
          if (!room) {
            console.log(`Room ${roomId} not found in database`);
            return;
          }
          console.log(`Found room:`, room);
          
          const hostUid = room.hostUid;
          const hostSocketId = this.userIdToSocketId.get(hostUid);
          console.log(`Host UID: ${hostUid}`);
          console.log(`Host Socket ID: ${hostSocketId}`);
          console.log(`All registered users:`, Array.from(this.userIdToSocketId.entries()));
          
          if (hostSocketId) {
            this.io.to(hostSocketId).emit('user-request-join', { roomId, uid, name });
            console.log(`Sent join request to host ${hostUid} (${hostSocketId})`);
          } else {
            console.log(`Host ${hostUid} not found or not connected`);
          }
        } catch (error) {
          console.error('Error in request-join-room:', error);
        }
      });

      // Debug: Log tất cả events
      
      // socket.onAny((eventName, ...args) => {
      //   console.log(`=== SOCKET EVENT RECEIVED ===`);
      //   console.log(`Event: ${eventName}`);
      //   console.log(`Args:`, args);
      // });
      // Host phản hồi
      socket.on('host-respond-join', ({ roomId, uid, accept }) => {
        const userSocketId = this.userIdToSocketId.get(uid);
        if (userSocketId) {
          if (accept) {
            this.io.to(userSocketId).emit('join-approved', { roomId });
            console.log(`Join approved for user ${uid}`);
          } else {
            this.io.to(userSocketId).emit('join-denied', { roomId });
            console.log(`Join denied for user ${uid}`);
          }
        } else {
          console.log(`User ${uid} not found or not connected`);
        }
      });

      // join or create gởi yêu cầu lên server  1
      socket.on('join-room', ({ roomId, uid, name }) => {
        socket.join(roomId);
        this.users.set(socket.id, { uid, name, roomId });

        this.io.to(roomId).emit('user-joined', {
          uid,
          name,
          socketId: socket.id,
        });
      });

      socket.on('offer', (data) => {
        this.io.to(data.target).emit('offer', data);
      });

      socket.on('answer', (data) => {
        this.io.to(data.target).emit('answer', data);
      });

      socket.on('candidate', (data) => {
        this.io.to(data.target).emit('candidate', data);
      });

      socket.on('kick-user', ({ roomId, socketId }) => {
        this.io.to(socketId).emit('kicked');
        this.io.to(roomId).emit('user-kicked', { socketId }); 
        this.users.delete(socketId); 
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const user = this.users.get(socket.id);
        if (user) {
          this.io.to(user.roomId).emit('user-left', {
            uid: user.uid,
            name: user.name,
            socketId: socket.id,
          });
          this.users.delete(socket.id);
        }
        // Xóa mapping userId -> socketId khi disconnect
        for (const [uid, socketId] of this.userIdToSocketId.entries()) {
          if (socketId === socket.id) {
            this.userIdToSocketId.delete(uid);
            break;
          }
        }
      });
    });
  }
}

export default function initSocketService(io) {
  new SocketService(io);
} 