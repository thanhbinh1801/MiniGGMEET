import { OK } from '../handler/success.reponse.js';
import AuthUtils from '../utils/authUtils.js';

export default class AuthController {
  constructor(AuthService) {
    this.authService = AuthService;
  }

  firebaseLogin = async (req, res, next) => {
    try {
      const { uid, name, email, picture } = req.user;
      
      const user = await this.authService.findOrCreateFirebaseUser({
        uid, name, email, picture
      });
      
      const sessionToken = AuthUtils.genSessionToken(user);
      
      res.cookie('sessionToken', sessionToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
      });
      
      new OK({
        message: "Firebase login successful",
        metadata: { 
          user: {
            id: user._id,
            uid: user.uid,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role
          }
        }
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  verifyToken = async (req, res, next) => {
    try {
      const { uid, name, email, picture } = req.user;
      
      const user = await this.authService.findOrCreateFirebaseUser({
        uid, name, email, picture
      });
      
      new OK({
        message: "Token verified successfully",
        metadata: { 
          user: {
            id: user._id,
            uid: user.uid,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role
          }
        }
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  logout = async (req, res, next) => {
    try {
      res.clearCookie('sessionToken', {
        httpOnly: true,
        sameSite: 'strict'
      });
      
      new OK({
        message: "Logout successful"
      }).send(res);
    } catch(error){
      next(error);
    }
  }
}

