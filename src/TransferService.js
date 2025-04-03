import { ethers } from 'ethers';

class TransferService {
  constructor(walletManager, walletConfig) {
    this.walletManager = walletManager;
    this.walletConfig = walletConfig;
  }

  async transfer(toAddress, amount) {
    try {
      const addressToUse = typeof toAddress === 'string' ? toAddress : toAddress.address;
      const cleanAddress = addressToUse.trim();
      const formattedAddress = cleanAddress.startsWith('0x') ? cleanAddress : `0x${cleanAddress}`;
      
      if (!ethers.isAddress(formattedAddress)) {
        throw new Error('Invalid recipient address. Please ensure the address format is correct (0x followed by 40 hex characters)');
      }

      const amountWei = ethers.parseEther(amount.toString());

      const balance = await this.walletManager.provider.getBalance(this.walletManager.wallet.address);
      if (balance < amountWei) {
        throw new Error(`Insufficient balance. Current balance: ${ethers.formatEther(balance)} ${this.walletManager.chain.symbol}`);
      }

      const tx = {
        to: formattedAddress,
        value: amountWei,
        gasLimit: this.walletConfig.gas.limit,
        gasPrice: ethers.parseUnits(this.walletConfig.gas.price, 'gwei')
      };

      const transaction = await this.walletManager.wallet.sendTransaction(tx);
      console.log(`📤 Transaction sent: ${transaction.hash}`);
      console.log(`🔍 Explorer: ${this.walletManager.chain.explorer}/tx/${transaction.hash}`);

      const receipt = await transaction.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      return receipt;

    } catch (error) {
      console.error(`Transfer error: ${error.message}`);
      throw error;
    }
  }

  async batchTransfer(numberOfWallets, fixedAmount = null, minAmount = null, maxAmount = null) {
    try {
      const wallets = [];
      let totalAmount = 0;

      for (let i = 0; i < numberOfWallets; i++) {
        const { wallet, transferAmount } = await this.walletManager.generateNewWallet(fixedAmount, minAmount, maxAmount);
        wallets.push({ wallet, amount: transferAmount });
        totalAmount += parseFloat(transferAmount);
      }

      const currentBalance = await this.walletManager.getBalance(this.walletManager.wallet.address);
      if (parseFloat(currentBalance) < totalAmount) {
        throw new Error(`Insufficient balance for batch transfer. Need: ${totalAmount} ${this.walletManager.chain.symbol}, Have: ${currentBalance} ${this.walletManager.chain.symbol}`);
      }

      console.log(`\n🚀 Starting batch transfer to ${numberOfWallets} wallets...`);
      console.log(`💰 Total amount to transfer: ${totalAmount} ${this.walletManager.chain.symbol}\n`);

      for (const { wallet, amount } of wallets) {
        console.log(`💸 Transferring ${amount} ${this.walletManager.chain.symbol} to ${wallet.address}...`);
        await this.transfer(wallet.address, amount);
        console.log(`✅ Transfer complete!\n`);
      }

      console.log(`🎉 Batch transfer completed successfully!`);
      return wallets;
    } catch (error) {
      console.error(`Error in batch transfer: ${error.message}`);
      throw error;
    }
  }
}

export default TransferService;