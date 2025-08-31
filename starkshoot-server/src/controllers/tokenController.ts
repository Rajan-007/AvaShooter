import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';  // Import ethers
import dotenv from 'dotenv';
import { Room } from '../models/Room'; // Import Room model

// Load environment variables
dotenv.config();

// Fuji (Avalanche Testnet) configuration
const RPC_URL = process.env.RPC_URL as string;  // Fuji RPC URL from environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;  // Private key for the wallet
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as string;  // ERC-20 contract address

// Hardcoded values for testing - replace with your actual deployed contract address
// Contract address where the tokens are deployed
const HARDCODED_CONTRACT_ADDRESS = "0xde5ED6c9A4B842202e15C4c163B9fBB0c655A8B7"; // Contract address
const HARDCODED_PRIVATE_KEY = "08b0bf9bdbcf3b392a2da59714b8e24cbb2dcc372f2573e565814ca48be56f9c"; // Private key for 0x02fA718Cdde037F6B4EFC85F4b46Cc83B6722a91


console.log(process.env.CONTRACT_ADDRESS);

// Debug environment variables (don't log private key)
console.log('🔧 Token Controller Configuration:');
console.log(`📡 RPC URL: ${RPC_URL ? 'Set' : 'Not set'}`);
console.log(`🔑 Private Key: ${PRIVATE_KEY ? 'Set' : 'Not set'}`);
console.log(`📄 Contract Address: ${CONTRACT_ADDRESS || 'Not set'}`);

// Use hardcoded values if environment variables are not set
const finalRPC_URL = RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
const finalPRIVATE_KEY = PRIVATE_KEY || HARDCODED_PRIVATE_KEY;
const finalCONTRACT_ADDRESS = CONTRACT_ADDRESS || HARDCODED_CONTRACT_ADDRESS;

console.log('🔧 Using configuration:');
console.log(`📡 RPC URL: ${finalRPC_URL}`);
console.log(`📄 Contract Address: ${finalCONTRACT_ADDRESS}`);
console.log(`🔑 Private Key: ${finalPRIVATE_KEY ? 'Set' : 'Not set'}`);

// Initialize the Ethereum provider using Fuji testnet (Avalanche)
const provider = new ethers.JsonRpcProvider(finalRPC_URL, 43113);

// Initialize the wallet with the private key and connect it to the provider
const wallet = new ethers.Wallet(finalPRIVATE_KEY, provider);

console.log(`👛 Wallet address: ${wallet.address}`);
console.log(`🌐 Network: Fuji (Avalanche Testnet)`);

// Add more detailed logging to help debug
console.log(`🔍 Expected wallet: 0x02fA718Cdde037F6B4EFC85F4b46Cc83B6722a91`);
console.log(`🔍 Current wallet: ${wallet.address}`);
console.log(`🔍 Wallet matches expected: ${wallet.address.toLowerCase() === '0x02fA718Cdde037F6B4EFC85F4b46Cc83B6722a91'.toLowerCase()}`);

// ERC-20 contract ABI
const abi = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "initialSupply",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

// Create contract instance
const contract = new ethers.Contract(finalCONTRACT_ADDRESS, abi, wallet);

// Function to validate contract and get basic info
async function validateContract() {
  try {
    const contractName = await contract.name();
    const contractSymbol = await contract.symbol();
    const contractDecimals = await contract.decimals();
    const totalSupply = await contract.totalSupply();
    
    console.log(`📄 Contract Info:`);
    console.log(`   Name: ${contractName}`);
    console.log(`   Symbol: ${contractSymbol}`);
    console.log(`   Decimals: ${contractDecimals}`);
    console.log(`   Total Supply: ${ethers.formatEther(totalSupply)} ${contractSymbol}`);
    
    // Also check the wallet's token balance
    const walletBalance = await contract.balanceOf(wallet.address);
    console.log(`💰 Wallet ${wallet.address} has: ${ethers.formatEther(walletBalance)} ${contractSymbol}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to get contract info:', error);
    console.error('   This might mean the contract address is incorrect or the contract is not deployed');
    return false;
  }
 }

 // Function to check server token balance
export async function getServerTokenBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    console.log(`🔍 Checking token balance for wallet: ${wallet.address}`);
    console.log(`📄 Contract address: ${finalCONTRACT_ADDRESS}`);
    
    const serverTokenBalance = await contract.balanceOf(wallet.address);
    const formattedBalance = ethers.formatEther(serverTokenBalance);
    
    console.log(`💰 Server wallet AST balance: ${formattedBalance} AST`);
    
    // Also check AVAX balance
    const avaxBalance = await provider.getBalance(wallet.address);
    console.log(`💰 Server wallet AVAX balance: ${ethers.formatEther(avaxBalance)} AVAX`);
    
    res.status(200).send({
      serverWallet: wallet.address,
      contractAddress: finalCONTRACT_ADDRESS,
      tokenBalance: formattedBalance,
      tokenSymbol: 'AST',
      avaxBalance: ethers.formatEther(avaxBalance),
      message: 'Server token balance retrieved successfully'
    });
  } catch (error: any) {
    console.error('❌ Error getting server token balance:', error);
    res.status(500).send({ error: 'Failed to get server token balance', details: error.message });
  }
}

// Function to find the correct contract address for the wallet
export async function findWalletContracts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    console.log(`🔍 Finding contracts for wallet: ${wallet.address}`);
    
    // List of known contract addresses to check
    const knownContracts = [
      "0xde5ED6c9A4B842202e15C4c163B9fBB0c655A8B7", // Your contract address
      "0x1Bc07dB7Aea904379680Ff53FfC88E8dBa5C2619", // Alternative contract
      // Add more contract addresses here if needed
    ];
    
    const results = [];
    
    for (const contractAddr of knownContracts) {
      try {
        const tempContract = new ethers.Contract(contractAddr, abi, provider);
        const balance = await tempContract.balanceOf(wallet.address);
        const formattedBalance = ethers.formatEther(balance);
        
        if (parseFloat(formattedBalance) > 0) {
          results.push({
            contractAddress: contractAddr,
            balance: formattedBalance,
            hasTokens: true
          });
        }
      } catch (error) {
        console.log(`❌ Contract ${contractAddr} not accessible or no tokens`);
      }
    }
    
    res.status(200).send({
      wallet: wallet.address,
      contractsWithTokens: results,
      message: 'Contract search completed'
    });
  } catch (error: any) {
    console.error('❌ Error finding contracts:', error);
    res.status(500).send({ error: 'Failed to find contracts', details: error.message });
  }
}

 // Function to handle token transfer
export async function transferTokens(req: Request, res: Response, next: NextFunction): Promise<void> {
	const { walletAddress, playerCount, roomId } = req.body;
  
	// Validate input parameters
	if (!walletAddress || !playerCount || !roomId) {
	  res.status(400).send({ error: "Missing required parameters" });
	  return;
	}
  
	try {
	  console.log(`🔄 Starting token transfer to: ${walletAddress}`);
	  console.log(`🎮 Player count: ${playerCount}, Room ID: ${roomId}`);
  
	  // Get room details from database
	  const room = await Room.findOne({ roomId: roomId });
	  if (!room) {
		console.error(`❌ Room not found: ${roomId}`);
		res.status(404).send({ error: 'Room not found', roomId });
		return;
	  }
  
	  // Get staking amount from room
	  const stakingAmount = room.stakingAmount || 0;
	  console.log(`💰 Room staking amount: ${stakingAmount} ${room.stakingToken || 'AST'}`);
  
	  // Calculate total pool (staking amount * player count)
	  const totalPool = stakingAmount * playerCount;
	  console.log(`🎯 Total pool: ${totalPool} (${stakingAmount} * ${playerCount})`);
  
	  // Calculate 80% of total pool
	  const transferAmount = totalPool * 0.8;
	  console.log(`🎯 Transfer amount (80%): ${transferAmount}`);
  
	  // Convert to token units (with 18 decimals)
	  const tokenAmount = ethers.parseUnits(transferAmount.toString(), 18);
	  console.log(`🎯 Token amount in wei: ${tokenAmount.toString()}`);
  
	  // Validate contract first
	  const isContractValid = await validateContract();
	  if (!isContractValid) {
		res.status(500).send({ error: 'Contract validation failed' });
		return;
	  }
  
	  // Check if the server wallet has enough AVAX for gas fees
	  const balance = await provider.getBalance(wallet.address);
	  console.log(`💰 Server wallet balance (AVAX): ${ethers.formatEther(balance)} AVAX`);
  
	  // Check if the server wallet has enough tokens to transfer
	  const serverTokenBalance = await contract.balanceOf(wallet.address);
	  console.log(`🎯 Server wallet token balance (AST): ${ethers.formatEther(serverTokenBalance)} AST`);
	  console.log(`🎯 Required tokens to transfer: ${ethers.formatEther(tokenAmount)} AST`);
  
	  if (serverTokenBalance < tokenAmount) {
		console.error('🎯 Server wallet has insufficient AST tokens');
		res.status(400).send({ 
		  error: 'Server wallet has insufficient AST tokens',
		  required: ethers.formatEther(tokenAmount),
		  available: ethers.formatEther(serverTokenBalance),
		  serverWallet: wallet.address,
		  message: 'Please send AST tokens to the server wallet first'
		});
		return;
	  }
  
	  // Initiate the token transfer transaction
	  console.log(`📤 Sending transaction...`);
	  const tx = await contract.transfer(walletAddress, tokenAmount);
	  console.log(`⏳ Transaction sent: ${tx.hash}`);
  
	  // Wait for the transaction to be mined
	  const receipt = await tx.wait();
	  console.log(`✅ Transaction confirmed! Block: ${receipt.blockNumber}`);
  
	  // Send success response with transaction hash
	  res.status(200).send({
		message: 'Tokens transferred successfully',
		transactionHash: receipt.transactionHash,
		blockNumber: receipt.blockNumber,
		playerCount,
		roomId,
		roomStakingAmount: stakingAmount,
		totalPool: totalPool,
		transferAmount: transferAmount,
		transferPercentage: '80%'
	  });
  
	} catch (error: any) {
	  console.error('❌ Error transferring tokens:', error);
  
	  if (error.code === 'INSUFFICIENT_FUNDS') {
		console.error('💸 Insufficient funds for gas fees');
		res.status(400).send({ error: 'Insufficient funds for gas' });
	  } else if (error.code === 'NETWORK_ERROR') {
		console.error('🌐 Network connection error');
		res.status(500).send({ error: 'Network connection error', details: error.message });
	  } else if (error.code === 'INVALID_ARGUMENT') {
		console.error('📝 Invalid argument provided');
		res.status(400).send({ error: 'Invalid argument provided', details: error.message });
	  } else {
		console.error('💥 Unexpected error occurred');
		res.status(500).send({ error: 'Failed to transfer tokens', details: error.message });
	  }
	}
  }
  