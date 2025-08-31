// tokenIntegration.js
import { ethers } from "ethers";
import tokenABI from "../abi/StackingGameToken.json";

// ----------------- CONTRACT ADDRESSES -----------------
const tokenContractAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || "0x1Bc07dB7Aea904379680Ff53FfC88E8dBa5C2619";
const pollAccountAddress = process.env.NEXT_PUBLIC_POLL_ACCOUNT_ADDRESS || "0xf06D8c7558AF7BEb88A28714ab157fa782869368";
const fujiChainId = parseInt(process.env.NEXT_PUBLIC_FUJI_CHAIN_ID || "43113");

// ----------------- HELPERS -----------------
const getProvider = async () => {
  if (!window.ethereum) throw new Error("MetaMask is not installed!");
  
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  // Request account access
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  
  // Get the network
  const network = await provider.getNetwork();
  
  // Check if we're on the correct network (Avalanche Fuji Testnet)
  if (network.chainId !== fujiChainId) { // Avalanche Fuji Testnet
    console.warn("Please switch to Avalanche Fuji Testnet. Current chainId:", network.chainId);
    console.warn(`Expected chainId: ${fujiChainId} (Avalanche Fuji Testnet)`);
    // Don't throw error, just warn - let the contract calls fail gracefully
  }
  
  return provider;
};

const getSigner = async () => {
  const provider = await getProvider();
  return provider.getSigner();
};

const getTokenContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(tokenContractAddress, tokenABI, signer);
};

// ----------------- TOKEN FUNCTIONS -----------------
export const getStakingTokenBalance = async (address) => {
  try {
    const contract = await getTokenContract();
    const balance = await contract.balanceOf(address);
    // Convert from wei to ether and preserve exact decimal places
    const formattedBalance = ethers.utils.formatEther(balance);
    // Return the exact value without any rounding
    return formattedBalance;
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return "0";
  }
};

// Function to get token symbol
export const getTokenSymbol = async () => {
  try {
    const contract = await getTokenContract();
    const symbol = await contract.symbol();
    return symbol;
  } catch (error) {
    console.error("Error fetching token symbol:", error);
    return "AST";
  }
};

// Function to get token name
export const getTokenName = async () => {
  try {
    const contract = await getTokenContract();
    const name = await contract.name();
    return name;
  } catch (error) {
    console.error("Error fetching token name:", error);
    return "AvaShooterToken";
  }
};

// Function to get token decimals
export const getTokenDecimals = async () => {
  try {
    const contract = await getTokenContract();
    const decimals = await contract.decimals();
    return decimals;
  } catch (error) {
    console.error("Error fetching token decimals:", error);
    return 18;
  }
};
