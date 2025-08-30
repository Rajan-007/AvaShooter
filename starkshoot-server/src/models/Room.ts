import { create } from 'domain';
import mongoose from 'mongoose';
import { start } from 'repl';

const roomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true, required: true },
  users: [{ type: String, ref: 'User' }],
  Duration: { type: Number, default: 0 }, 
  gameStarted: { type: Boolean, default: false },
  gameEnded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  startedAt: { type: Date, default: null },
  maxMembers: { type: Number, default: 6 },
  creator: { type: String, default: null },
  winner: { type: String, ref: 'User', default: null }
});

export const Room = mongoose.model('Room', roomSchema);