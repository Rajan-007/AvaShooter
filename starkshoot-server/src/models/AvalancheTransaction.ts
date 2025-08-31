import mongoose, { Schema, Document } from 'mongoose';

export interface IAvalancheTransaction extends Document {
  txHash: string;
  roomId?: string;
  operation: 'create' | 'update' | 'delete' | 'get';
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: number;
  gasPrice?: string;
  gasCost?: string;
  from: string;
  to: string;
  value?: string;
  data?: string;
  ipfsHash?: string;
  ipfsLink?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AvalancheTransactionSchema: Schema = new Schema({
  txHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  roomId: {
    type: String,
    required: false,
    index: true
  },
  operation: {
    type: String,
    enum: ['create', 'update', 'delete', 'get'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
    index: true
  },
  blockNumber: {
    type: Number,
    required: false,
    index: true
  },
  gasUsed: {
    type: Number,
    required: false
  },
  gasPrice: {
    type: String,
    required: false
  },
  gasCost: {
    type: String,
    required: false
  },
  from: {
    type: String,
    required: true,
    index: true
  },
  to: {
    type: String,
    required: true,
    index: true
  },
  value: {
    type: String,
    required: false
  },
  data: {
    type: String,
    required: false
  },
  ipfsHash: {
    type: String,
    required: false,
    index: true
  },
  ipfsLink: {
    type: String,
    required: false
  },
  error: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Create compound indexes for efficient queries
AvalancheTransactionSchema.index({ operation: 1, status: 1 });
AvalancheTransactionSchema.index({ roomId: 1, operation: 1 });
AvalancheTransactionSchema.index({ createdAt: -1 });
AvalancheTransactionSchema.index({ blockNumber: -1 });

export default mongoose.model<IAvalancheTransaction>('AvalancheTransaction', AvalancheTransactionSchema);
