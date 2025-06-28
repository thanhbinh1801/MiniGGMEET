import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: String,
  hostUid: String,
  members: [{
    uid: String,
    name: String,
    socketId: String
  }],
  bannedUserIds: [String]
}, { timestamps: true });

const RoomModel = mongoose.model('Room', roomSchema);
export default RoomModel;
