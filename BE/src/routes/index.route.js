import RoomRouter from './room.route.js';
import UserRouter from './user.route.js';
import AuthRouter from './auth.route.js';

export default (app) => {
  const roomRouter = new RoomRouter();
  const userRouter = new UserRouter();
  const authRouter = new AuthRouter();
  app.use('/api/v1/room', roomRouter.getRouter());
  app.use('/api/v1/user', userRouter.getRouter());
  app.use('/api/v1/auth', authRouter.getRouter());
};