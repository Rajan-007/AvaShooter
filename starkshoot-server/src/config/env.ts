import dotenv from 'dotenv';

dotenv.config();

// Check required environment variables
export const checkEnvironment = () => {
  const required = ['MONGO_URI'];
  const optional = ['RPC_URL', 'PRIVATE_KEY', 'CONTRACT_ADDRESS', 'AVALANCHE_RPC_URL', 'AVALANCHE_PRIVATE_KEY', 'AVALANCHE_CONTRACT_ADDRESS'];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing required environment variables: ${missing.join(', ')}`);
    console.warn('💡 Some features may not work properly');
  }
  
  const optionalMissing = optional.filter(key => !process.env[key]);
  if (optionalMissing.length > 0) {
    console.log(`ℹ️  Optional environment variables not set: ${optionalMissing.join(', ')}`);
    console.log('💡 Contract features will be disabled');
  }
  
  return {
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ghibli-game',
    rpcUrl: process.env.RPC_URL,
    privateKey: process.env.PRIVATE_KEY,
    contractAddress: process.env.CONTRACT_ADDRESS,
    hasContractConfig: !!(process.env.RPC_URL && process.env.PRIVATE_KEY && process.env.CONTRACT_ADDRESS),
    
    // Avalanche contract config
    avalancheRpcUrl: process.env.AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
    avalanchePrivateKey: process.env.AVALANCHE_PRIVATE_KEY,
    avalancheContractAddress: process.env.AVALANCHE_CONTRACT_ADDRESS || '0x79085841AB26F1b71bB67D21F1b0767ed00F6759',
    hasAvalancheConfig: !!(process.env.AVALANCHE_PRIVATE_KEY && process.env.AVALANCHE_CONTRACT_ADDRESS)
  };
};

export const env = checkEnvironment();
