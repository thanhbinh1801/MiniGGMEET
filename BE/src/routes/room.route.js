import {Router} from 'express';
import RoomService from '../services/room.service.js';
import RoomController from '../controllers/room.controllers.js';
import Room from '../models/room.models.js';
import asyncHandler from '../middlewares/asyncHandler.js';

class RoomRouter {
  constructor(){
    this.router = Router();
    this.roomService = new RoomService(Room);
    this.roomController = new RoomController(this.roomService);
    this.setupRoutes();
  }   

  setupRoutes(){  
    this.router.get('/:id', asyncHandler(this.roomController.getRoomById));
    this.router.post('/', asyncHandler(this.roomController.createRoom));
    this.router.delete('/:id', asyncHandler(this.roomController.deleteRoom));
    this.router.post('/:id/join', asyncHandler(this.roomController.requestJoinRoom));
    this.router.post('/:id/accept', asyncHandler(this.roomController.acceptJoinRoom));
    this.router.post('/:id/kick', asyncHandler(this.roomController.kickMember));
    this.router.get('/:id/pending', asyncHandler(this.roomController.getPendingRequests));
  }

  getRouter() {
    return this.router;
  }
}
export default RoomRouter;