import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: { type: String, unique: true, required: true }, // Firebase UID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: String,
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);
export default UserModel;