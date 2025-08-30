import mongoose from 'mongoose';
import { kill } from 'process';

const userSchema = new mongoose.Schema({
  walletAddress: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  isStaked: { type: Boolean, default: false },
  // kills: { type: Number, default: 0 },
  // score: { type: Number, default: 0 },
  currentRoomId: { type: String, default: '' },
  currentRoomDuration: { type: Number, default: 0 },
  ParticipatedRooms: [{
    Room: { type: String, ref: 'CompletedRoom' },
    iswinner: { type: Boolean, default: false },
    // score: { type: Number, default: 0 },
    // createdAt: { type: Date, default: Date.now },
    // kills: { type: Number, default: 0 },
    gameTime: { type: Number, default: '' }

  }],
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', userSchema);