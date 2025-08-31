import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Gun', 'Grenade', 'Character', 'Diamond', 'Gold']
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: String,
    required: false // Optional for now, can be linked to wallet address later
  }
});

export default mongoose.model('Purchase', purchaseSchema);
