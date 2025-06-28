import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import AuthService from '../services/auth.service.js';
import User from '../models/user.models.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import firebaseAuth from '../middlewares/firebaseAuth.js';  

class AuthRouter {
  constructor(){
    this.router = Router();
    this.authService = new AuthService(User);
    this.authController = new AuthController(this.authService);
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.post('/firebase-login', firebaseAuth.verifyToken,
      asyncHandler(this.authController.firebaseLogin)
    );

    this.router.post('/verify-token', firebaseAuth.verifyToken,
      asyncHandler(this.authController.verifyToken)
    );

    this.router.post('/logout', 
      asyncHandler(this.authController.logout)
    );
  }
  
  getRouter() {
    return this.router;
  }
}

export default AuthRouter;