import { NotFoundError } from '../handler/error.reponse.js';

export default class UserService {
  constructor(UserModel) {
    this.UserModel = UserModel;
  }

  async getAllUsers() {
    const users = await this.UserModel.find({});
    if (!users || users.length === 0) {
      throw new NotFoundError("No users found");
    }
    const userData = users.map( user => {
      const{ password, ...rest} = user.toObject();
      return rest;
    })
    return userData;
  }

  async getUserByID(userId) {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const { password, ...userData } = user.toObject();
    return userData;
  }

  async getUserByUid(uid) {
    const user = await this.UserModel.findOne({ uid });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const { password, ...userData } = user.toObject();
    return userData;
  }

  async updateUser(userId, data) {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const dataUpdate = {
      name: data.name !== undefined ? data.name : user.name,
      email: data.email !== undefined ? data.email : user.email,
      avatar: data.avatar !== undefined ? data.avatar : user.avatar,
      phone: data.phone !== undefined ? data.phone : user.phone,
      age: data.age !== undefined ? data.age : user.age,
      gender: data.gender !== undefined ? data.gender : user.gender,
    };

    const updatedUser = await this.UserModel.findByIdAndUpdate(userId, dataUpdate, { new: true });
    if (!updatedUser) {
      throw new NotFoundError("User not found or update failed");
    }

    const { password, ...userData } = updatedUser.toObject();
    return userData;
  }

  async deleteUser(userId) {
    const user = await this.UserModel.findByIdAndDelete(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async getMe(userId) {
    const user = await this.UserModel.findById(userId);
    if (!user) {
        throw new NotFoundError("User not found");
    }
    const {password, ...userData} = user.toObject();
    return userData;
  }
}