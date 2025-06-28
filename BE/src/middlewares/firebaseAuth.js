import admin from '../config/firebase.js';
import { AuthFailureError } from '../handler/error.reponse.js';

class FirebaseAuth{
  async verifyToken(req, res, next) {
    try {
      const bearer = req.headers.authorization;

      if (!bearer || !bearer.startsWith('Bearer ')) {
        throw new AuthFailureError('Authorization header is missing');
      }

      const idToken = bearer.split(' ')[1];

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken; 
      next();
    } catch (error) {
      next(error);
    }
  }
}

export default new FirebaseAuth();
