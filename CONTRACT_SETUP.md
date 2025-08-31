# Contract Setup Guide

## **🚨 IMPORTANT: You need to provide the correct contract address and private key**

### **Step 1: Deploy Your Contract**
1. Go to [Remix](https://remix.ethereum.org/)
2. Create a new file called `StackingGameToken.sol`
3. Paste your contract code:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract StackingGameToken {
    string public name = "AvaShooterToken";
    string public symbol = "AST";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply; // deployer gets all tokens
    }

    function transfer(address to, uint256 value) external returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Allowance exceeded");
        allowance[from][msg.sender] -= value;
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "Invalid recipient");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }
}
```

4. **Compile** the contract
5. **Deploy** to **Avalanche Fuji Testnet** with:
   - **Initial Supply**: `10000000000` (10 billion tokens)
   - **Network**: Avalanche Fuji Testnet (Chain ID: 43113)

### **Step 2: Get Your Contract Address**
After deployment, copy the **contract address** from Remix.

### **Step 3: Update the Server Configuration**
In `starkshoot-server/src/controllers/tokenController.ts`, update these lines:

```typescript
// Replace with your actual deployed contract address
const HARDCODED_CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";

// Replace with the private key for wallet 0x02fA718Cdde037F6B4EFC85F4b46Cc83B6722a91
const HARDCODED_PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE";
```

### **Step 4: Get the Private Key**
You need the private key for wallet `0x02fA718Cdde037F6B4EFC85F4b46Cc83B6722a91` that has the tokens.

### **Step 5: Test the Setup**
1. Restart your server
2. Check the logs to see:
   - ✅ Wallet address matches `0x02fA718Cdde037F6B4EFC85F4b46Cc83B6722a91`
   - ✅ Contract info is retrieved successfully
   - ✅ Wallet has token balance

### **Step 6: Send Some AVAX for Gas**
Make sure the server wallet has some AVAX for gas fees (at least 0.1 AVAX).

## **🔧 Quick Test**
After setup, test with:
```bash
curl http://localhost:5001/api/tokens/server-balance
```

This should return the token balance of your server wallet.
