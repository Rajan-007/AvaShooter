import mongoose, { Schema, Document } from 'mongoose';

export interface IAvalancheRoom extends Document {
  roomId: string;
  ipfsHash: string;
  ipfsLink: string;
  txHash: string;
  blockNumber?: number;
  gasUsed?: number;
  gasPrice?: string;
  status: 'pending' | 'confirmed' | 'failed';
  data: any; // The actual room data stored on IPFS
  createdAt: Date;
  updatedAt: Date;
}

const AvalancheRoomSchema: Schema = new Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ipfsHash: {
    type: String,
    required: true,
    index: true
  },
  ipfsLink: {
    type: String,
    required: true
  },
  txHash: {
    type: String,
    required: true,
    index: true
  },
  blockNumber: {
    type: Number,
    required: false
  },
  gasUsed: {
    type: Number,
    required: false
  },
  gasPrice: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
    index: true
  },
  data: {
    type: Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
AvalancheRoomSchema.index({ roomId: 1, status: 1 });
AvalancheRoomSchema.index({ createdAt: -1 });

export default mongoose.model<IAvalancheRoom>('AvalancheRoom', AvalancheRoomSchema);
