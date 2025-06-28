class SocketService {
  constructor(io){
    this.io = io;
    this.users = new Map();
    this.registerEvents();  
  }

  registerEvents() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

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
      });
    });
  }
}

export default function initSocketService(io) {
  new SocketService(io);
}