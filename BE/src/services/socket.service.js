import RoomModel from '../models/room.models.js';

class SocketService {
  constructor(io){
    this.io = io;
    this.users = new Map();
    this.userIdToSocketId = new Map();
    this.peerStatus = new Map();
    this.registerEvents();  
  }

  registerEvents() {
    this.io.on('connection', (socket) => {
      console.log(`=== NEW SOCKET CONNECTION ===`);
      console.log(`User connected: ${socket.id}`);

      // Đăng ký user
      socket.on('register-user', ({ uid }, callback) => {
        this.userIdToSocketId.set(uid, socket.id);
        this.peerStatus.set(socket.id, {
          connected: false,
          lastActivity: Date.now()
        });
        console.log(`User registered: ${uid} -> ${socket.id}`);
        if (typeof callback === 'function') {
          callback({ success: true });
        }
      });

      // Xử lý yêu cầu tham gia phòng
      socket.on('request-join-room', async ({ roomId, uid, name }, callback) => {
        try {
          const room = await RoomModel.findOne({ roomId });
          if (!room) return callback({ success: false, message: 'Room not found' });
          
          if (room.bannedUserIds.includes(uid)) {
            return callback({ success: false, message: 'You are banned' });
          }

          if (room.members.some(m => m.uid === uid)) {
            return callback({ success: false, message: 'Already in room' });
          }

          const hostSocketId = this.userIdToSocketId.get(room.hostUid);
          if (!hostSocketId) {
            return callback({ success: false, message: 'Host unavailable' });
          }

          if (!room.pendingRequests.some(req => req.uid === uid)) {
            room.pendingRequests.push({ uid, name });
            await room.save();
          }

          // Gửi yêu cầu tới host với timeout 30s
          const timeout = setTimeout(() => {
            callback({ success: false, message: 'No host response' });
          }, 30000);

          this.io.to(hostSocketId).emit('user-request-join', { 
            roomId, uid, name 
          }, (response) => {
            clearTimeout(timeout);
            callback(response);
          });

        } catch (error) {
          console.error('Join room error:', error);
          callback({ success: false, message: 'Server error' });
        }
      });




      // Khi client gửi tin nhắn
      socket.on("chat-message", ({ roomId, senderName, senderId, message }) => {
        const timestamp = Date.now();
        this.io.to(roomId).emit("chat-message", {
          senderName,
          senderId,
          message,
          timestamp,
        });
      });






      // Host phản hồi yêu cầu
      socket.on('host-respond-join', async ({ roomId, uid, accept }, callback) => {
        try {
          const room = await RoomModel.findOne({ roomId });
          if (!room) return callback({ success: false, message: 'Room not found' });

          const userSocketId = this.userIdToSocketId.get(uid);
          if (!userSocketId) return callback({ success: false, message: 'User not connected' });

          if (accept) {
            const userIndex = room.pendingRequests.findIndex(req => req.uid === uid);
            if (userIndex === -1) {
              return callback({ success: false, message: 'Invalid request' });
            }

            const user = room.pendingRequests[userIndex];
            room.members.push(user);
            room.pendingRequests.splice(userIndex, 1);
            await room.save();

            this.io.to(userSocketId).emit('join-approved', { 
              roomId,
              members: room.members
            });
          } else {
            this.io.to(userSocketId).emit('join-denied', { roomId });
          }

          this.io.to(roomId).emit('room-updated', {
            members: room.members,
            pendingRequests: room.pendingRequests
          });

          callback({ success: true });

        } catch (error) {
          console.error('Host respond error:', error);
          callback({ success: false, message: 'Server error' });
        }
      });

      // WebRTC Signaling với timeout 5s
      socket.on('offer', (data, callback) => {
        this.io.to(data.target).timeout(5000).emit('offer', data, (err) => {
          if (typeof callback === 'function') {
            if (err) {
              console.error('Offer failed:', err);
              callback({ success: false });
            } else {
              callback({ success: true });
            }
          }
        });
      });

      socket.on('answer', (data, callback) => {
        this.io.to(data.target).timeout(5000).emit('answer', data, (err) => {
          if (typeof callback === 'function') {
            if (err) {
              console.error('Answer failed:', err);
              callback({ success: false });
            } else {
              callback({ success: true });
            }
          }
        });
      });

     socket.on('candidate', (data, callback) => { 
  this.io.to(data.target).emit('candidate', data);
  if (typeof callback === 'function') {
    callback({ success: true });
  }
});



      // Quản lý phòng
      socket.on('join-room', ({ roomId, uid, name }) => {
        socket.join(roomId);
        this.users.set(socket.id, { uid, name, roomId });

        // Gửi danh sách thành viên sau 300ms để các peer cũ kịp set listener
        setTimeout(() => {
          const clients = Array.from(this.users.entries())
            .filter(([sockId, user]) => user.roomId === roomId && sockId !== socket.id)
            .map(([sockId, user]) => ({ socketId: sockId, uid: user.uid, name: user.name }));

          socket.emit('room-members', clients); // Gửi lại cho peer mới
        }, 500);

        // Thông báo cho các peer cũ biết có peer mới
        socket.to(roomId).emit('user-joined', {
          uid, name, socketId: socket.id
        });
      });





      socket.on('toggle-camera', ({ roomId, uid, isCameraOn }) => {
        // Broadcast cho các client khác trong phòng
        socket.to(roomId).emit('toggle-camera', { uid, isCameraOn });
      });

      socket.on('disconnect', async () => {
        console.log(`User disconnected: ${socket.id}`);
        const user = this.users.get(socket.id);
        if (user) {
          try {
            const room = await RoomModel.findOne({ roomId: user.roomId });
            if (room) {
              room.members = room.members.filter(m => m.uid !== user.uid);
              await room.save();
              this.io.to(user.roomId).emit('room-updated', {
                members: room.members
              });
            }
          } catch (error) {
            console.error('Disconnect error:', error);
          }

          this.io.to(user.roomId).emit('user-left', {
            uid: user.uid,
            name: user.name,
            socketId: socket.id,
          });
          this.users.delete(socket.id);
        }

        // Clean up mappings
        for (const [uid, sockId] of this.userIdToSocketId.entries()) {
          if (sockId === socket.id) {
            this.userIdToSocketId.delete(uid);
            break;
          }
        }
        this.peerStatus.delete(socket.id);
      });
    });
  }
}

export default function initSocketService(io) {
  new SocketService(io);
}