export const chains = [
  {
    name: "BSC Testnet",
    rpcUrl: process.env.RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
    chainId: "97",
    symbol: "tBNB",
    explorer: "https://testnet.bscscan.com",
    isMainnet: false
  },
  {
    name: "Ethereum Mainnet",
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/your-api-key",
    chainId: "1",
    symbol: "ETH",
    explorer: "https://etherscan.io",
    isMainnet: true
  },
  {
    name: "0g Testnet",
    rpcUrl: "https://evmrpc-testnet.0g.ai",
    chainId: "16600",
    symbol: "0G",
    explorer: "https://chainscan-newton.0g.ai",
    isMainnet: false
  },
  {
    name: "Tea Sepolia",
    rpcUrl: "https://tea-sepolia.g.alchemy.com/v2/vot1HrCuj9CmekoM2FKNnv6h4Mnzjyb_",
    chainId: "10218",
    symbol: "TEA",
    explorer: "https://sepolia.tea.xyz",
    isMainnet: false
  }
];
