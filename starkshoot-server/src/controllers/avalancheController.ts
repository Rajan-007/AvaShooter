import { Request, Response } from 'express';
import { ethers } from 'ethers';
import AvalancheContractABI from '../abi/AvalancheContract.json';
import { env } from '../config/env';
import { initializePinata } from "./initializePinata";


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
    await tx.wait();

    console.log(`✅ Room ${roomId} created successfully`);

    res.json({
      success: true,
      txHash: tx.hash,
      roomId,
      ipfsLink,
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
    
    await tx.wait();
    console.log(`✅ Room ${id} updated successfully`);
    
    res.json({ 
      success: true, 
      txHash: tx.hash,
      roomId: id,
      newLink,
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
