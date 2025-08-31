import { Request, Response } from 'express';
import { ethers } from 'ethers';
import AvalancheContractABI from '../abi/AvalancheContract.json';
import { env } from '../config/env';
import { initializePinata } from "./initializePinata";
import AvalancheRoom from '../models/AvalancheRoom';
import AvalancheTransaction from '../models/AvalancheTransaction';


// Lazy initialization to prevent ENS errors on startup
let avalancheProvider: ethers.JsonRpcProvider | null = null;
let avalancheWallet: ethers.Wallet | null = null;
let avalancheContract: ethers.Contract | null = null;

function initializeAvalancheContract() {
  if (!env.hasAvalancheConfig) {
    throw new Error('Avalanche contract features are not configured. Please set AVALANCHE_PRIVATE_KEY environment variable.');
  }
  
  if (!avalancheProvider || !avalancheWallet || !avalancheContract) {
    try {
      const rpcUrl = env.avalancheRpcUrl!;
      const privateKey = env.avalanchePrivateKey!;
      const contractAddress = env.avalancheContractAddress!;
      
      avalancheProvider = new ethers.JsonRpcProvider(rpcUrl);
      avalancheWallet = new ethers.Wallet(privateKey, avalancheProvider);
      avalancheContract = new ethers.Contract(contractAddress, AvalancheContractABI, avalancheWallet);
      
      console.log('✅ Avalanche contract initialized successfully');
      console.log(`🔗 Connected to: ${rpcUrl}`);
      console.log(`📝 Contract: ${contractAddress}`);
    } catch (error) {
      console.error('❌ Failed to initialize Avalanche contract:', error);
      throw error;
    }
  }
  return { avalancheProvider, avalancheWallet, avalancheContract };
}

// Create room

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🏠 Create room request received:", req.body);

    const { roomId, data } = req.body;

    if (!roomId || !data) {
      res.status(400).json({
        success: false,
        error: "roomId and data (JSON) are required",
      });
      return;
    }

    // Upload JSON to IPFS
    const pinata = initializePinata();
    console.log("📦 Uploading room data to IPFS...");

    const ipfsResult = await pinata.pinJSONToIPFS(data, {
      pinataMetadata: { name: `room-${roomId}` },
    });

    const ipfsLink = `ipfs://${ipfsResult.IpfsHash}`;
    console.log(`🔗 Stored JSON in IPFS: ${ipfsLink}`);

    // Store the IPFS link in Avalanche contract
    const { avalancheContract } = initializeAvalancheContract();

    console.log(`🏗️ Creating room ${roomId} with IPFS link: ${ipfsLink}`);
    const tx = await avalancheContract.createRoom(roomId, ipfsLink);

    console.log(`📝 Transaction sent: ${tx.hash}`);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log(`✅ Room ${roomId} created successfully`);

    // Save to MongoDB
    try {
      // Save room data
      const avalancheRoom = new AvalancheRoom({
        roomId,
        ipfsHash: ipfsResult.IpfsHash,
        ipfsLink,
        txHash: tx.hash,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        gasPrice: tx.gasPrice?.toString(),
        status: 'confirmed',
        data
      });
      await avalancheRoom.save();

      // Save transaction data
      const avalancheTx = new AvalancheTransaction({
        txHash: tx.hash,
        roomId,
        operation: 'create',
        status: 'confirmed',
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        gasPrice: tx.gasPrice?.toString(),
        gasCost: receipt?.gasUsed ? (BigInt(receipt.gasUsed) * BigInt(tx.gasPrice || 0)).toString() : undefined,
        from: tx.from,
        to: tx.to,
        value: tx.value?.toString(),
        data: tx.data,
        ipfsHash: ipfsResult.IpfsHash,
        ipfsLink
      });
      await avalancheTx.save();

      console.log(`💾 Saved room and transaction data to MongoDB`);
    } catch (dbError) {
      console.error('❌ Error saving to MongoDB:', dbError);
      // Don't fail the request if MongoDB save fails
    }

    res.json({
      success: true,
      txHash: tx.hash,
      roomId,
      ipfsLink,
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt?.gasUsed?.toString(),
      message: "Room created successfully with IPFS data",
    });
  } catch (error: any) {
    console.error("❌ Error creating room:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

// Get all rooms from MongoDB
export const getAllRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Get all rooms request received');
    
    const rooms = await AvalancheRoom.find({})
      .sort({ createdAt: -1 })
      .limit(100); // Limit to prevent overwhelming response
    
    console.log(`✅ Retrieved ${rooms.length} rooms from database`);
    
    res.json({
      success: true,
      rooms,
      count: rooms.length
    });
  } catch (error: any) {
    console.error('❌ Error getting all rooms:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

// Get room by ID from MongoDB
export const getRoomById = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Get room by ID request received:', req.params);
    
    const { id } = req.params;
    
    const room = await AvalancheRoom.findOne({ roomId: id });
    
    if (!room) {
      res.status(404).json({
        success: false,
        error: 'Room not found in database'
      });
      return;
    }
    
    console.log(`✅ Retrieved room ${id} from database`);
    
    res.json({
      success: true,
      room
    });
  } catch (error: any) {
    console.error('❌ Error getting room by ID:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

// Get all transactions from MongoDB
export const getAllTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Get all transactions request received');
    
    const transactions = await AvalancheTransaction.find({})
      .sort({ createdAt: -1 })
      .limit(100); // Limit to prevent overwhelming response
    
    console.log(`✅ Retrieved ${transactions.length} transactions from database`);
    
    res.json({
      success: true,
      transactions,
      count: transactions.length
    });
  } catch (error: any) {
    console.error('❌ Error getting all transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

// Get transactions by room ID
export const getTransactionsByRoomId = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Get transactions by room ID request received:', req.params);
    
    const { roomId } = req.params;
    
    const transactions = await AvalancheTransaction.find({ roomId })
      .sort({ createdAt: -1 });
    
    console.log(`✅ Retrieved ${transactions.length} transactions for room ${roomId}`);
    
    res.json({
      success: true,
      transactions,
      count: transactions.length
    });
  } catch (error: any) {
    console.error('❌ Error getting transactions by room ID:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

// Get blockchain statistics
export const getBlockchainStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📊 Get blockchain stats request received');
    
    const [totalRooms, totalTransactions, confirmedTransactions, pendingTransactions] = await Promise.all([
      AvalancheRoom.countDocuments(),
      AvalancheTransaction.countDocuments(),
      AvalancheTransaction.countDocuments({ status: 'confirmed' }),
      AvalancheTransaction.countDocuments({ status: 'pending' })
    ]);
    
    // Get recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRooms = await AvalancheRoom.countDocuments({ createdAt: { $gte: oneDayAgo } });
    const recentTransactions = await AvalancheTransaction.countDocuments({ createdAt: { $gte: oneDayAgo } });
    
    console.log('✅ Retrieved blockchain statistics');
    
    res.json({
      success: true,
      stats: {
        totalRooms,
        totalTransactions,
        confirmedTransactions,
        pendingTransactions,
        recentRooms,
        recentTransactions
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting blockchain stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};


// Update room
export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Update room request received:', req.params, req.body);
    
    const { id } = req.params;
    const { newLink } = req.body;
    
    if (!newLink) {
      res.status(400).json({ 
        success: false,
        error: 'newLink is required' 
      });
      return;
    }
    
    const { avalancheContract } = initializeAvalancheContract();
    
    console.log(`🔄 Updating room ${id} with new link: ${newLink}`);
    
    const tx = await avalancheContract.updateRoom(id, newLink);
    console.log(`📝 Transaction sent: ${tx.hash}`);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log(`✅ Room ${id} updated successfully`);

    // Save to MongoDB
    try {
      // Update existing room data
      await AvalancheRoom.findOneAndUpdate(
        { roomId: id },
        {
          ipfsLink: newLink,
          txHash: tx.hash,
          blockNumber: receipt?.blockNumber,
          gasUsed: receipt?.gasUsed?.toString(),
          gasPrice: tx.gasPrice?.toString(),
          status: 'confirmed',
          updatedAt: new Date()
        },
        { new: true }
      );

      // Save transaction data
      const avalancheTx = new AvalancheTransaction({
        txHash: tx.hash,
        roomId: id,
        operation: 'update',
        status: 'confirmed',
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        gasPrice: tx.gasPrice?.toString(),
        gasCost: receipt?.gasUsed ? (BigInt(receipt.gasUsed) * BigInt(tx.gasPrice || 0)).toString() : undefined,
        from: tx.from,
        to: tx.to,
        value: tx.value?.toString(),
        data: tx.data,
        ipfsLink: newLink
      });
      await avalancheTx.save();

      console.log(`💾 Updated room and saved transaction data to MongoDB`);
    } catch (dbError) {
      console.error('❌ Error saving to MongoDB:', dbError);
      // Don't fail the request if MongoDB save fails
    }
    
    res.json({ 
      success: true, 
      txHash: tx.hash,
      roomId: id,
      newLink,
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt?.gasUsed?.toString(),
      message: 'Room updated successfully'
    });
  } catch (error: any) {
    console.error('❌ Error updating room:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
};

// Delete room
export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🗑️ Delete room request received:', req.params);
    
    const { id } = req.params;
    const { avalancheContract } = initializeAvalancheContract();
    
    console.log(`🗑️ Deleting room ${id}`);
    
    const tx = await avalancheContract.deleteRoom(id);
    console.log(`📝 Transaction sent: ${tx.hash}`);
    
    await tx.wait();
    console.log(`✅ Room ${id} deleted successfully`);
    
    res.json({ 
      success: true, 
      txHash: tx.hash,
      roomId: id,
      message: 'Room deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ Error deleting room:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
};

// Get room
export const getRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Get room request received:', req.params);
    
    const { id } = req.params;
    const { avalancheContract } = initializeAvalancheContract();
    
    console.log(`📋 Getting room ${id}`);
    
    const room = await avalancheContract.getRoom(id);
    console.log(`✅ Room ${id} retrieved:`, room);
    
    res.json({ 
      success: true,
      roomId: room[0].toString(), 
      link: room[1] 
    });
  } catch (error: any) {
    console.error('❌ Error getting room:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
};

// Get owner
export const getOwner = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('👑 Get owner request received');
    
    const { avalancheContract } = initializeAvalancheContract();
    
    const owner = await avalancheContract.owner();
    console.log(`✅ Contract owner: ${owner}`);
    
    res.json({ 
      success: true,
      owner 
    });
  } catch (error: any) {
    console.error('❌ Error getting owner:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
};
