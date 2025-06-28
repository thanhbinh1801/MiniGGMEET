import HashService from '../utils/HashService.js';
import { NotFoundError, BadRequestError } from '../handler/error.reponse.js';
import AuthUtils from '../utils/authUtils.js';

export default class AuthService {
  constructor(User) {
    this.UserModel = User;
  }

  async findOrCreateFirebaseUser(firebaseUser) {
    try {
      let user = await this.UserModel.findOne({ uid: firebaseUser.uid });
      
      if (!user) {
        user = new this.UserModel({
          uid: firebaseUser.uid,
          name: firebaseUser.name,
          email: firebaseUser.email,
          avatar: firebaseUser.picture
        });
        await user.save();
        console.log('New Firebase user created:', user.email);
      } else {
        user.name = firebaseUser.name;
        user.email = firebaseUser.email;
        user.avatar = firebaseUser.picture;
        await user.save();
        console.log('Existing Firebase user updated:', user.email);
      }
      
      return user;
    } catch (error) {
      console.error('Error in findOrCreateFirebaseUser:', error);
      throw new BadRequestError('Failed to create or update user');
    }
  }

  async RefreshToken(refreshToken) {
    const payload = AuthUtils.verifyToken(refreshToken);
    console.log("Payload from refresh token:", payload);
    const user = payload;
    const accessToken = AuthUtils.genAccessToken(user);
    const newRefreshToken = AuthUtils.genRefreshToken(user);
    return { accessToken, refreshToken: newRefreshToken };
  }
}