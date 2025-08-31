# Environment Setup for AvaShooter

## Frontend Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Avalanche Fuji Testnet Configuration
NEXT_PUBLIC_FUJI_CHAIN_ID=43113
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0xde5ED6c9A4B842202e15C4c163B9fBB0c655A8B7
NEXT_PUBLIC_POLL_ACCOUNT_ADDRESS=0xf06D8c7558AF7BEb88A28714ab157fa782869368

# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001

# Optional: Enable testnets in RainbowKit
NEXT_PUBLIC_ENABLE_TESTNETS=true
```

## Backend Environment Variables

In the `starkshoot-server` directory, create a `.env` file with:

```env
# Avalanche Fuji Testnet Configuration
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
CONTRACT_ADDRESS=0xde5ED6c9A4B842202e15C4c163B9fBB0c655A8B7
PRIVATE_KEY=your_server_wallet_private_key_here

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Server Configuration
PORT=5001
```

## Network Information

- **Chain ID:** 43113 (Avalanche Fuji Testnet)
- **RPC URL:** https://api.avax-test.network/ext/bc/C/rpc
- **Explorer:** https://testnet.snowtrace.io
- **Currency:** AVAX (test tokens)

## Getting Test Tokens

1. **Fuji AVAX:** Visit https://faucet.avax.network/ and select "Fuji Testnet"
2. **AST Tokens:** You'll need to have AST tokens in your wallet for testing

## Important Notes

- All frontend environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- The server wallet needs both AVAX (for gas) and AST tokens (for transfers)
- Make sure your wallet is connected to Avalanche Fuji testnet (Chain ID: 43113)
