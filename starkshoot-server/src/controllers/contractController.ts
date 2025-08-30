import { Request, Response } from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import ContractABI from '../abi/staking.json';

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contractAddress = process.env.CONTRACT_ADDRESS!;
const contract = new ethers.Contract(contractAddress, ContractABI, wallet);

// POST /api/contract/assign
export const assignToMatch = async (req: Request, res: Response) => {
  const { matchId, players } = req.body;

  if (!matchId || !players || !Array.isArray(players)) {
    res.status(400).json({ error: 'matchId and players[] required' });
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
export const setWinner = async (req: Request, res: Response) => {
  const { matchId, winner } = req.body;

  if (!matchId || !winner) {
    res.status(400).json({ error: 'matchId and winner required' });
  }

  try {
    const tx = await contract.setWinner(matchId, winner);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};