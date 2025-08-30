import express from 'express';
import { 
  createRoom, 
  updateRoom, 
  deleteRoom, 
  getRoom, 
  getOwner 
} from '../controllers/avalancheController';

const router = express.Router();

// Room management routes
router.post('/room', createRoom);           // Create room
router.put('/room/:id', updateRoom);        // Update room
router.delete('/room/:id', deleteRoom);     // Delete room
router.get('/room/:id', getRoom);           // Get room
router.get('/owner', getOwner);             // Get contract owner

export default router;
