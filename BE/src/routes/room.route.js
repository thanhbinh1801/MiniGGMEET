  import {Router} from 'express';
  import RoomService from '../services/room.service.js';
  import RoomController from '../controllers/room.controllers.js';
  import Room from '../models/room.models.js';
  import asyncHandler from '../middlewares/asyncHandler.js';
  import Validate from '../middlewares/validate.js';
  import AuthValidate from '../validators/Auth.validate.js';

  class RoomRouter {
    constructor(){
      this.router = Router();
      this.roomService = new RoomService(Room);
      this.roomController = new RoomController(this.roomService);
      this.setupRoutes();
    }

    setupRoutes(){  
      this.router.get('/rooms/:id', asyncHandler(this.roomController.getRoomById));
      this.router.post('/rooms', asyncHandler(this.roomController.createRoom));
      this.router.delete('/rooms/:id', asyncHandler(this.roomController.deleteRoom));
    }

    getRouter() {
      return this.router;
    }
  }
  export default RoomRouter;