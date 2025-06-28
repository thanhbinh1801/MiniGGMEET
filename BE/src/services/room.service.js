import {ConflictRequestError, BadRequestError, NotFoundError } from '../handler/error.reponse.js';

export default class RoomService {
  constructor(Room) {
    this.Room = Room;
  }

  createRoom = async (roomData) => {
    try {
      const room = await this.Room.create(roomData);
      return room;
    } catch (error) {
      throw new ConflictRequestError("Room already exists");
    }
  }

  getRoomById = async (roomId) => {
    try {
      const room = await this.Room.findById(roomId);
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

}