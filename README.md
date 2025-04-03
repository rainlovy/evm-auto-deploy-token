# Auto Transfer EVM

Application for automated transfers between wallets across various EVM (Ethereum Virtual Machine) chains.

## Features

- Support for multiple EVM chains
- Wallet management using private keys
- Automatic balance checking
- Auto transfer with transaction confirmation
- Real-time transaction status monitoring
- Batch transfers with random or fixed amounts
- Generate multiple wallets with automatic transfer

## Project Structure

```
├── config/
│   ├── chains.js    # EVM chain configuration
│   ├── index.js     # Configuration exports
│   └── wallet.js    # Wallet configuration
├── data/
│   ├── .env         # Environment variables
│   └── wallet.txt   # Wallet data
└── src/
    ├── CLI.js           # Command line interface
    ├── TransferService.js    # Transfer service
    ├── WalletManager.js      # Wallet management
    └── index.js        # Application entry point
```

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```
3. Copy `.env.example` to `.env` and fill in the configuration:
```env
# Main wallet private key
WALLET_PRIVATE_KEY="your-private-key-here"

# RPC node (optional)
RPC_URL="your-rpc-url" 
```

## Configuration

### Chain
Edit `config/chains.js` to add or modify chains:
```javascript
export const chains = {
  bsc: {
    name: "BSC",
    chainId: 56,
    rpc: "https://bsc-dataseed.binance.org"
  }
  // Add other chains here
}
```

### Wallet
Wallet data is stored in `data/wallet.txt` with the format:
```
privateKey1
privateKey2
```

## Usage

### Manual Transfer
```bash
npm start
```
Follow the interactive menu to:
- Select chain
- Choose source and destination wallets
- Enter transfer amount
- Confirm transaction

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright © 2025 Winsnip