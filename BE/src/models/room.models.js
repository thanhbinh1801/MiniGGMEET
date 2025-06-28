import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: String,
  hostUid: String,
  hostName: String,
  members: [{
    uid: String,
    name: String,
    socketId: String
  }],
  bannedUserIds: [String],
  pendingRequests: [{
    uid: String,
    name: String
  }]
}, { timestamps: true });

const RoomModel = mongoose.model('Room', roomSchema);
export default RoomModel;
