import {ConflictRequestError, BadRequestError, NotFoundError } from '../handler/error.reponse.js';

export default class RoomService {
  constructor(Room) {
    this.Room = Room;
  }

  createRoom = async (roomData) => {
    try {
      const room = await this.Room.create({
        ...roomData,
        members: [{ uid: roomData.hostUid, name: roomData.hostName }],
        bannedUserIds: [],
        pendingRequests: []
      });
      return room;
    } catch (error) {
      throw new ConflictRequestError("Room already exists");
    }
  }

  getRoomById = async (roomId) => {
    try {
      const room = await this.Room.findOne({roomId});
      if (!room) {
        throw new NotFoundError("Room not found");
      }
      return room;
    } catch (error) {
      throw new BadRequestError("Invalid room ID");
    }
  }

  deleteRoom = async (roomId) => {
    try {
      const result = await this.Room.findByIdAndDelete(roomId);
      if (!result) {
        throw new NotFoundError("Room not found");
      }
      return result;
    } catch (error) {
      throw new BadRequestError("Invalid room ID");
    }
  }

  requestJoinRoom = async (roomId, user) => {
    const room = await this.Room.findById(roomId);
    if (!room) throw new NotFoundError("Room not found");
    if (room.bannedUserIds.includes(user.uid)) {
      throw new BadRequestError("You have been banned from this room");
    }
    if (room.members.some(m => m.uid === user.uid)) {
      throw new BadRequestError("You are already a member of this room");
    }
    if (room.pendingRequests.some(m => m.uid === user.uid)) {
      throw new BadRequestError("You have already requested to join");
    }
    room.pendingRequests.push(user);
    await room.save();
    return { pendingRequests: room.pendingRequests };
  }

  acceptJoinRoom = async (roomId, uid) => {
    const room = await this.Room.findById(roomId);
    if (!room) throw new NotFoundError("Room not found");
    const userIndex = room.pendingRequests.findIndex(m => m.uid === uid);
    if (userIndex === -1) throw new BadRequestError("User not in pending requests");
    const user = room.pendingRequests[userIndex];
    room.members.push(user);
    room.pendingRequests.splice(userIndex, 1);
    await room.save();
    return { members: room.members };
  }

  kickMember = async (roomId, uid) => {
    const room = await this.Room.findById(roomId);
    if (!room) throw new NotFoundError("Room not found");
    room.members = room.members.filter(m => m.uid !== uid);
    if (!room.bannedUserIds.includes(uid)) {
      room.bannedUserIds.push(uid);
    }
    room.pendingRequests = room.pendingRequests.filter(m => m.uid !== uid);
    await room.save();
    return { bannedUserIds: room.bannedUserIds };
  }

  getPendingRequests = async (roomId) => {
    const room = await this.Room.findById(roomId);
    if (!room) throw new NotFoundError("Room not found");
    return room.pendingRequests;
  }
}