// stakingIntegration.js
import { ethers } from "ethers";
import stakingABI from "../abi/staking.json";
import tokenABI from "../abi/token.json";

// ----------------- CONTRACT ADDRESSES -----------------
const stakingContractAddress = "0xc89fa65478ca94804079ff6dd9a68befb974cda8";
const stakingTokenAddress = "0x17b1cf06826a77f03bf4754760d4c8ffd93d94d7"; // Token used for staking
const rewardTokenAddress = "0x99997ba3a2bd92c94f18a523caffb33a0020e80a";   // Token used for rewards

// ----------------- HELPERS -----------------
const getProvider = async () => {
  if (!window.ethereum) throw new Error("MetaMask is not installed!");
  
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  // Request account access
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  
  // Get the network
  const network = await provider.getNetwork();
  
  // Check if we're on the correct network (Avalanche C-Chain or testnet)
  if (network.chainId !== 43114 && network.chainId !== 43113) { // Avalanche Mainnet or Fuji Testnet
    console.warn("Please switch to Avalanche C-Chain network. Current chainId:", network.chainId);
    // Don't throw error, just warn - let the contract calls fail gracefully
  }
  
  return provider;
};

const getSigner = async () => {
  const provider = await getProvider();
  return provider.getSigner();
};

const getStakingContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(stakingContractAddress, stakingABI, signer);
};

const getStakingTokenContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(stakingTokenAddress, tokenABI, signer);
};

const getRewardTokenContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(rewardTokenAddress, tokenABI, signer);
};

// ----------------- STAKING TOKEN FUNCTIONS -----------------
export const mintStakingToken = async (amount) => {
  try {
    const contract = await getStakingTokenContract();
    const tx = await contract.mint(amount);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Error minting tokens:", error);
    throw error;
  }
};

export const approveStakingTokens = async (amount) => {
  try {
    const contract = await getStakingTokenContract();
    const tx = await contract.approve(stakingContractAddress, amount);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Error approving tokens:", error);
    throw error;
  }
};

export const getStakingTokenBalance = async (address) => {
  try {
    const contract = await getStakingTokenContract();
    const balance = await contract.balanceOf(address);
    return ethers.utils.formatEther(balance); // Convert from wei to ether
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return "0";
  }
};

// ----------------- REWARD TOKEN FUNCTIONS -----------------
export const mintRewardToken = async (amount) => {
  try {
    const contract = await getRewardTokenContract();
    const tx = await contract.mint(amount);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Error minting reward tokens:", error);
    throw error;
  }
};

export const getRewardTokenBalance = async (address) => {
  try {
    const contract = await getRewardTokenContract();
    const balance = await contract.balanceOf(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error("Error fetching reward balance:", error);
    return "0";
  }
};

// ----------------- STAKING CONTRACT FUNCTIONS -----------------
export const stakeTokens = async (amount) => {
  try {
    const amountstk = ethers.utils.parseEther(amount.toString());
    const contract = await getStakingContract();
    const tx = await contract.stake(amountstk);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Error staking tokens:", error);
    throw error;
  }
};

export const withdrawTokens = async (amount) => {
  try {
    const contract = await getStakingContract();
    const tx = await contract.withdraw(amount);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Error withdrawing tokens:", error);
    throw error;
  }
};

export const claimRewards = async () => {
  try {
    const contract = await getStakingContract();
    const tx = await contract.getReward();
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Error claiming rewards:", error);
    throw error;
  }
};

export const exitStaking = async () => {
  try {
    const contract = await getStakingContract();
    const tx = await contract.exit();
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Error exiting staking:", error);
    throw error;
  }
};

export const getStakedBalance = async (address) => {
  try {
    const contract = await getStakingContract();
    const balance = await contract.stakedBalanceOf(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error("Error fetching staked balance:", error);
    return "0";
  }
};

export const getEarnedRewards = async (address) => {
  try {
    const contract = await getStakingContract();
    const rewards = await contract.earned(address);
    return ethers.utils.formatEther(rewards);
  } catch (error) {
    console.error("Error fetching earned rewards:", error);
    return "0";
  }
};

export const getTotalStaked = async () => {
  try {
    const contract = await getStakingContract();
    const total = await contract.totalStaked();
    return ethers.utils.formatEther(total);
  } catch (error) {
    console.error("Error fetching total staked:", error);
    return "0";
  }
};

// Function to get all stake info for a user
export const GET_ALL_STAKE_INFO = async (address) => {
  try {
    const contract = await getStakingContract();
    // This would need to be implemented based on your contract's structure
    // For now, returning a mock structure
    return [
      {
        matchId: "1",
        staked: "10",
        reward: "5",
        isWinner: true,
        claimed: false,
      },
    ];
  } catch (error) {
    console.error("Error fetching stake info:", error);
    return [];
  }
};

// ----------------- EVENT LISTENERS -----------------
export const listenForStake = (callback) => {
  const contract = getStakingContract();
  contract.on("Stake", callback);
  return () => contract.off("Stake", callback);
};

export const listenForRewardPaid = (callback) => {
  const contract = getStakingContract();
  contract.on("RewardPaid", callback);
  return () => contract.off("RewardPaid", callback);
};
