// stakingIntegration.js
import { ethers } from "ethers";
import stakingABI from "../abi/staking.json";
import tokenABI from "../abi/token.json";

// ----------------- CONTRACT ADDRESSES -----------------
const stakingContractAddress = "0xc89fa65478ca94804079ff6dd9a68befb974cda8";
const stakingTokenAddress = "0x17b1cf06826a77f03bf4754760d4c8ffd93d94d7"; // Token used for staking
const rewardTokenAddress = "0x99997ba3a2bd92c94f18a523caffb33a0020e80a";   // Token used for rewards

// ----------------- HELPERS -----------------
const getProvider = () => {
  if (!window.ethereum) throw new Error("MetaMask is not installed!");
  return new ethers.providers.Web3Provider(window.ethereum);
};

const getSigner = () => {
  return getProvider().getSigner();
};

const getStakingContract = () =>
  new ethers.Contract(stakingContractAddress, stakingABI, getSigner());

const getStakingTokenContract = () =>
  new ethers.Contract(stakingTokenAddress, tokenABI, getSigner());

const getRewardTokenContract = () =>
  new ethers.Contract(rewardTokenAddress, tokenABI, getSigner());

// ----------------- STAKING TOKEN FUNCTIONS -----------------
export const mintStakingToken = async (amount) => {
  const contract = getStakingTokenContract();
  const tx = await contract.mint(amount);
  await tx.wait();
  return tx;
};

export const approveStakingTokens = async (amount) => {
  const contract = getStakingTokenContract();
  const tx = await contract.approve(stakingContractAddress, amount);
  await tx.wait();
  return tx;
};

export const getStakingTokenBalance = async (address) => {
  const contract = getStakingTokenContract();
  return await contract.balanceOf(address);
};

// ----------------- REWARD TOKEN FUNCTIONS -----------------
export const mintRewardToken = async (amount) => {
  const contract = getRewardTokenContract();
  const tx = await contract.mint(amount);
  await tx.wait();
  return tx;
};

export const getRewardTokenBalance = async (address) => {
  const contract = getRewardTokenContract();
  return await contract.balanceOf(address);
};

// ----------------- STAKING CONTRACT FUNCTIONS -----------------
export const stakeTokens = async (amount) => {
  const amountstk = ethers.utils.parseEther(amount.toString());
  const contract = getStakingContract();
  const tx = await contract.stake(amountstk);
  await tx.wait();
  return tx;
};

export const withdrawTokens = async (amount) => {
  const contract = getStakingContract();
  const tx = await contract.withdraw(amount);
  await tx.wait();
  return tx;
};

export const claimRewards = async () => {
  const contract = getStakingContract();
  const tx = await contract.getReward();
  await tx.wait();
  return tx;
};

export const exitStaking = async () => {
  const contract = getStakingContract();
  const tx = await contract.exit();
  await tx.wait();
  return tx;
};

export const getStakedBalance = async (address) => {
  const contract = getStakingContract();
  return await contract.stakedBalanceOf(address);
};

export const getEarnedRewards = async (address) => {
  const contract = getStakingContract();
  return await contract.earned(address);
};

export const getTotalStaked = async () => {
  const contract = getStakingContract();
  return await contract.totalStaked();
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
