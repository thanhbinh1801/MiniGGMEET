import { OK, CREATED } from '../handler/success.reponse.js';

export default class RoomController{
  constructor(RoomService) {
    this.RoomService = RoomService;
  }
  createRoom = async (req, res, next) => {
    try {
      const roomData = req.body;
      const room = await this.RoomService.createRoom(roomData);
      new CREATED({
        message: "Room created successfully",
        metadata: { room }
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  getRoomById = async (req, res, next) => {
    try {
      const roomId = req.params.id;
      const room = await this.RoomService.getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      new OK({
        message: "Room retrieved successfully",
        metadata: { room }
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
  
  deleteRoom = async (req, res, next) => {
    try {
      const roomId = req.params.id;
      const result = await this.RoomService.deleteRoom(roomId);
      if (!result) {
        return res.status(404).json({ message: "Room not found" });
      }
      new OK({
        message: "Room deleted successfully"
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  requestJoinRoom = async (req, res, next) => {
    try {
      const roomId = req.params.id;
      const { uid, name } = req.body;
      const result = await this.RoomService.requestJoinRoom(roomId, { uid, name });
      new OK({
        message: "Join request sent",
        metadata: result
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  acceptJoinRoom = async (req, res, next) => {
    try {
      const roomId = req.params.id;
      const { uid } = req.body;
      const result = await this.RoomService.acceptJoinRoom(roomId, uid);
      new OK({
        message: "User accepted to room",
        metadata: result
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  kickMember = async (req, res, next) => {
    try {
      const roomId = req.params.id;
      const { uid } = req.body;
      const result = await this.RoomService.kickMember(roomId, uid);
      new OK({
        message: "User kicked from room",
        metadata: result
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  getPendingRequests = async (req, res, next) => {
    try {
      const roomId = req.params.id;
      const pending = await this.RoomService.getPendingRequests(roomId);
      new OK({
        message: "Pending requests fetched",
        metadata: { pending }
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
}