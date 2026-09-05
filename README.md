# Arcane Cards Marketplace

A decentralized marketplace for unique game cards on an EVM testnet. Cards are ERC-721 NFTs with tokenURI metadata stored on IPFS; the marketplace uses escrow and ETH-denominated listings.

## Features
- Unique ERC-721 token IDs via OpenZeppelin Counters-style incrementing IDs
- Metadata fields: image, name, description, attributes/rarity
- IPFS upload flow for image + metadata (Pinata JWT)
- Mint, list, cancel listing, and buy
- Wallet connection through injected EIP-1193 providers (MetaMask)
- Testnet-ready: configure any chain ID and deployed addresses in `frontend/.env`
- Marketplace gallery and connected-wallet inventory
- Foundry unit tests for minting and marketplace core flows

## Smart contracts
`contracts/GameCard.sol` stores token ownership and token URIs.
`contracts/CardMarketplace.sol` escrows listed NFTs and pays the seller on purchase.

## Run contracts
```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge test
```

Deploy to Sepolia (example):
```bash
export PRIVATE_KEY=0x...
export RPC_URL=https://sepolia.infura.io/v3/...
export ETHERSCAN_API_KEY=...
forge script script/Deploy.s.sol:Deploy --rpc-url "$RPC_URL" --broadcast --verify
```

Copy the printed addresses into `frontend/.env`.

## Run frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Set `VITE_PINATA_JWT` only for a demo/prototype. For production, move IPFS pinning behind a server-side endpoint so the JWT is never exposed in the browser.
