import express from 'express';
import { 
  createRoom, 
  updateRoom, 
  deleteRoom, 
  getRoom, 
  getOwner,
  getAllRooms,
  getRoomById,
  getAllTransactions,
  getTransactionsByRoomId,
  getBlockchainStats
} from '../controllers/avalancheController';

const router = express.Router();

// Room management routes
router.post('/room', createRoom);           // Create room
router.put('/room/:id', updateRoom);        // Update room
router.delete('/room/:id', deleteRoom);     // Delete room
router.get('/room/:id', getRoom);           // Get room
router.get('/owner', getOwner);             // Get contract owner

// Database routes
router.get('/rooms', getAllRooms);          // Get all rooms from DB
router.get('/rooms/db/:id', getRoomById);   // Get room by ID from DB
router.get('/transactions', getAllTransactions); // Get all transactions from DB
router.get('/transactions/:roomId', getTransactionsByRoomId); // Get transactions by room ID
router.get('/stats', getBlockchainStats);   // Get blockchain statistics

export default router;
