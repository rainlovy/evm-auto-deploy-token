export const walletConfig = {
  get privateKey() {
    const key = process.env.WALLET_PRIVATE_KEY;
    if (!key) {
      throw new Error('WALLET_PRIVATE_KEY tidak ditemukan di environment variables');
    }
    return key;
  },
  
  gas: {
    limit: process.env.GAS_LIMIT || "300000",
    price: process.env.GAS_PRICE || "5" // dalam Gwei
  },

  transaction: {
    maxConfirmationTime: process.env.CONFIRMATION_TIMEOUT * 1000 || 60000, // dalam ms
    minAmount: process.env.MIN_TRANSFER_AMOUNT || 0.1,
    maxAmount: process.env.MAX_TRANSFER_AMOUNT || 1.0,
    delayBetweenTransfers: process.env.TRANSFER_DELAY * 1000 || 60000 // dalam ms
  }
};