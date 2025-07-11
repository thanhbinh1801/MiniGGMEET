import { AuthFailureError } from '../handler/error.reponse.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config'; 
const secret_key = process.env.JWT_SECRET_KEY;

export default class AuthUtils {
  static genAccessToken(user) {
    return jwt.sign({ id: user.id, username: user.username, role: user.role }, secret_key, { expiresIn: '1h' });
  }

  static genRefreshToken(user) {
    return jwt.sign({ id: user.id, username: user.username, role: user.role }, secret_key, { expiresIn: '30d' });
  }

  static genSessionToken(user) {
    return jwt.sign({ 
      id: user._id, 
      uid: user.uid, 
      name: user.name, 
      email: user.email,
      role: user.role 
    }, secret_key, { expiresIn: '7d' });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, secret_key);
    } catch (error) {
      throw new AuthFailureError("Invalid or expired token");
    }
  }
}
