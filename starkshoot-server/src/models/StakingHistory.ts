import mongoose from 'mongoose';

const stakingHistorySchema = new mongoose.Schema({
  walletAddress: { type: String, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const StakingHistory = mongoose.model('StakingHistory', stakingHistorySchema);