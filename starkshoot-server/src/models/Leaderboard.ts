import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true },
  kills: { type: Number, required: true },
  score: { type: Number, required: true },
  roomId: { type: String, required: true },
  room: { type: String, ref: 'CompletedRoom' },
  username: { type: String, required: true },
  gameTime: { type: String}
});

export const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);