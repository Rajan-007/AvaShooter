// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyERC20Token is ERC20, Ownable {
    uint256 public immutable maxSupply; // Total maximum supply
    uint256 public immutable maxMintPerWallet; // Max tokens each wallet can mint

    mapping(address => uint256) public mintedAmount; // Track minted per wallet

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply,
        uint256 _maxSupply,
        uint256 _maxMintPerWallet
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        // ✅ Pass msg.sender to Ownable
        require(
            _maxSupply >= initialSupply,
            "Max supply must be >= initial supply"
        );

        maxSupply = _maxSupply * 10 ** decimals();
        maxMintPerWallet = _maxMintPerWallet * 10 ** decimals();

        // Mint initial supply to owner
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    // Public mint with limit
    function mint(uint256 amount) external {
        uint256 amountWithDecimals = amount * 10 ** decimals();

        require(
            mintedAmount[msg.sender] + amountWithDecimals <= maxMintPerWallet,
            "Mint limit reached for wallet"
        );
        require(
            totalSupply() + amountWithDecimals <= maxSupply,
            "Exceeds max supply"
        );

        mintedAmount[msg.sender] += amountWithDecimals;
        _mint(msg.sender, amountWithDecimals);
    }

    // Fetch token balance of any wallet
    function fetchTokenBalance(address wallet) external view returns (uint256) {
        return balanceOf(wallet) / 10 ** decimals();
    }
}
