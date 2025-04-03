import { ethers } from 'ethers';
import path from 'path';

class WalletManager {
  constructor(chain) {
    this.chain = chain;
    this.provider = new ethers.JsonRpcProvider(chain.rpcUrl);
    this.wallet = null;
  }

  async initializeWallet(privateKey) {
    if (!privateKey) {
      throw new Error('Private key not found in .env file');
    }
    const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    try {
      this.wallet = new ethers.Wallet(formattedPrivateKey, this.provider);
      console.log('✨ Wallet successfully initialized');
      console.log('🔑 Wallet address:', this.wallet.address);
      return this.wallet;
    } catch (error) {
      throw new Error(`Failed to initialize wallet: ${error.message}`);
    }
  }

  async readWalletsFromFile(filename) {
    const filePath = path.join(process.cwd(), filename);
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf8');
      const wallets = [];
      
      const lines = content.trim().split(/[\r\n]+/).map(line => {
        return line.trim();
      }).filter(line => line && !line.startsWith('#'));
      
      for (const line of lines) {
        const formattedAddress = line.startsWith('0x') ? line : `0x${line}`;
        if (formattedAddress.length !== 42) {
          console.warn(`Skipping invalid address (wrong length): ${line}`);
          continue;
        }
        
        if (ethers.isAddress(formattedAddress)) {
          wallets.push({ address: formattedAddress });
        } else {
          console.warn(`Skipping invalid address (wrong format): ${line}`);
        }
      }
      
      if (wallets.length === 0) {
        console.error('No valid wallet addresses found in wallet.txt');
        throw new Error('No valid wallet addresses found in file. Please ensure address format is correct (0x followed by 40 hex characters)');
      }
      
      console.log(`📖 Successfully read ${wallets.length} wallet addresses from file`);
      console.log('🎯 Target wallet address:', wallets[0].address);
      return wallets;
    } catch (error) {
      console.error(`Error reading wallet file: ${error.message}`);
      throw error;
    }
  }

  async generateNewWallet(transferAmount = null, minAmount = null, maxAmount = null) {
    try {
      const fs = await import('fs/promises');
      const newWallet = ethers.Wallet.createRandom();
      
      let amount = transferAmount;
      if (!transferAmount && minAmount !== null && maxAmount !== null) {
        const min = parseFloat(minAmount);
        const max = parseFloat(maxAmount);
        amount = (Math.random() * (max - min) + min).toFixed(8);
      }
      
      const walletInfo = `Address: ${newWallet.address}\nPrivate Key: ${newWallet.privateKey}\nTransfer Amount: ${amount} ${this.chain.symbol}\n\n`;
      
      await fs.appendFile(path.join(process.cwd(), 'data/generated_wallets.txt'), walletInfo);
      console.log(`✨ New wallet generated and saved to generated_wallets.txt`);
      console.log(`🔑 Address: ${newWallet.address}`);
      console.log(`💰 Transfer Amount: ${amount} ${this.chain.symbol}`);
      
      return { wallet: newWallet, transferAmount: amount };
    } catch (error) {
      console.error(`Error generating wallet: ${error.message}`);
      throw error;
    }
  }

  async getBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error(`Error getting balance: ${error.message}`);
      throw error;
    }
  }
}

export default WalletManager;