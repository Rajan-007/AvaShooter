import { Request, Response } from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import ContractABI from '../abi/GameContract.json';

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contractAddress = process.env.CONTRACT_ADDRESS!;
const contract = new ethers.Contract(contractAddress, ContractABI, wallet);

// POST /api/contract/assign
export const assignToMatch = async (req: Request, res: Response): Promise<void> => {
  const { matchId, players } = req.body;

  if (!matchId || !players || !Array.isArray(players)) {
    res.status(400).json({ error: 'matchId and players[] required' });
    return;
  }

  try {
    const tx = await contract.assignToMatch(matchId, players);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/contract/set-winner
export const setWinner = async (req: Request, res: Response): Promise<void> => {
  const { matchId, winner } = req.body;

  if (!matchId || !winner) {
    res.status(400).json({ error: 'matchId and winner required' });
    return;
  }

  try {
    const tx = await contract.setWinner(matchId, winner);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const createMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, entryFee, maxPlayers } = req.body;
    
    if (!roomId || !entryFee || !maxPlayers) {
      res.status(400).json({ 
        error: 'roomId, entryFee, and maxPlayers are required' 
      });
      return;
    }

    console.log("Creating match with:", { roomId, entryFee, maxPlayers });
    const result = await createMatchOnContract(roomId, entryFee, maxPlayers);
    
    if (result) {
      res.json({ 
        success: true, 
        txHash: result.hash,
        matchId: result.matchId,
        message: "Match created successfully"
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to create match' 
      });
    }
  } catch (error: any) {
    console.error("Error in createMatch API:", error);
    res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
};

async function createMatchOnContract(roomId: string, entryFee: string, maxPlayers: number) {
  try {
    console.log("Creating match on contract...");
    
    // Convert roomId string to bytes32 format
    const roomIdBytes32 = ethers.zeroPadValue(ethers.toUtf8Bytes(roomId), 32);
    console.log("RoomId converted to bytes32:", roomIdBytes32);
    
    // Ensure entryFee is a valid BigNumber
    const entryFeeBN = ethers.parseEther(entryFee);
    console.log("Entry fee converted to BigNumber:", entryFeeBN.toString());
    
    // Ensure maxPlayers is a valid number
    const maxPlayersBN = BigInt(maxPlayers);
    console.log("Max players converted to BigNumber:", maxPlayersBN.toString());
    
    const tx = await contract.createMatch(roomIdBytes32, entryFeeBN, maxPlayersBN);
    console.log("Tx sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Tx confirmed in block:", receipt.blockNumber);

    // Look for event logs
    const event = receipt.logs
      .map((log: any) => {
        try { return contract.interface.parseLog(log); }
        catch { return null; }
      })
      .find((e: any) => e && e.name === "MatchCreated");

    if (event) {
      console.log("✅ MatchCreated event:", event.args);
      return {
        hash: tx.hash,
        matchId: event.args.roomId,
        args: event.args
      };
    }

    return {
      hash: tx.hash,
      matchId: roomIdBytes32,
      args: null
    };

  } catch (err) {
    console.error("Error creating match on contract:", err);
    throw err;
  }
}