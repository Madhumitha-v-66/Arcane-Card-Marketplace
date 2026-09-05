# Arcane-Card-Marketplace
Arcane Card Marketplace is a decentralized marketplace for unique digital game cards built on the Ethereum Sepolia testnet. Cards are ERC-721 NFTs with tokenURI metadata stored on IPFS; the marketplace uses escrow and ETH-denominated listings.

# The application allows users to:
-Mint unique game cards with individual token IDs
-Add a name, description, image, rarity, and other attributes to each card
-Store card images and metadata on IPFS
-Set a price and list cards for sale
-Purchase cards listed by other users
-Cancel active listings
-Connect a MetaMask wallet
-View available cards in a marketplace gallery
-View cards owned by the connected wallet
-Interact with the smart contracts on the Ethereum Sepolia testnet

## Features
- Unique ERC-721 token IDs via OpenZeppelin Counters-style incrementing IDs
- Metadata fields: image, name, description, attributes/rarity
- IPFS upload flow for image + metadata (Pinata JWT)
- Mint, list, cancel listing, and buy
- Wallet connection through injected EIP-1193 providers (MetaMask)
- Testnet-ready: configure any chain ID and deployed addresses in `frontend/.env`
- Marketplace gallery and connected-wallet inventory
- Foundry unit tests for minting and marketplace core flows

# Tech Stack
-Solidity
-Ethereum Sepolia Testnet
-Foundry / Forge
-OpenZeppelin Contracts
-React
-Vite
-Ethers.js
-MetaMask
-IPFS

# Setup Instructions
1. Clone the repository:
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd arcane-card-marketplace

2. Install the Solidity dependencies:
forge install OpenZeppelin/openzeppelin-contracts --no-commit

3. Build the smart contracts:
forge build

4. Run the tests:
forge test

# Testnet & Contract Addresses
The project uses the Ethereum Sepolia testnet.
-Network:
Ethereum Sepolia
Chain ID: 11155111
Currency: Sepolia ETH

-GameCard contract:
0xdEFB240f2C639A57735A6745aA499977E06DdE84

-CardMarketplace contract:
0xe6F379114390262b4e4f5D68e0F7B9301D0C5A3D

# IPFS Implementation
Each card image is uploaded to IPFS and receives a unique CID.
The card metadata is stored as a JSON file on IPFS. Example:
{
  "name": "Flame Dragon",
  "description": "A legendary dragon card with powerful fire abilities.",
  "image": "ipfs://<IMAGE_CID>",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    },
    {
      "trait_type": "Element",
      "value": "Fire"
    },
    {
      "trait_type": "Power",
      "value": 95
    }
  ]
}

## Run frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

