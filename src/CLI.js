import readline from 'readline/promises';
import { chains } from '../config/chains.js';

class CLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async selectChain() {
    console.log('\nSelect chain:')
    chains.forEach((chain, index) => {
      console.log(`${index + 1}. ${chain.name} (${chain.symbol}${chain.isMainnet ? ' - MAINNET' : ''})`)
    });

    let chainIndex;
    while (true) {
      const chainChoice = await this.rl.question('Choose chain number (1-' + chains.length + '): ');
      chainIndex = parseInt(chainChoice) - 1;
      if (chainIndex >= 0 && chainIndex < chains.length) break;
      console.log('Invalid choice, please try again.');
    }

    return chains[chainIndex];
  }

  async selectOperation() {
    console.log('\nSelect option:')
    console.log('1. Transfer to addresses from wallet.txt')
    console.log('2. Generate new wallet')
    console.log('3. Transfer to manual address')

    let option;
    while (true) {
      option = parseInt(await this.rl.question('Choose option (1-3): '));
      if (option >= 1 && option <= 3) break;
      console.log('Invalid choice, please try again.');
    }
    return option;
  }

  async getTransferAmount(symbol) {
    let amount;
    while (true) {
      console.log(`\nEnter the amount of ${symbol} to transfer:`);
      amount = await this.rl.question('Amount: ');
      
      if (isNaN(amount) || parseFloat(amount) <= 0) {
        console.log('Error: Please enter a valid amount (positive number)');
        continue;
      }
      break;
    }
    return amount;
  }

  async getTransferMode() {
    console.log('\nSelect transfer mode:');
    console.log('1. Fixed amount');
    console.log('2. Random amount');
    
    const transferMode = parseInt(await this.rl.question('Choose mode (1-2): '));
    if (transferMode !== 1 && transferMode !== 2) {
      throw new Error('Error: Invalid mode selection');
    }
    return transferMode;
  }

  async getRandomAmountRange(symbol) {
    console.log('\nEnter transfer amount range:');
    const minAmount = await this.rl.question(`Minimum amount ${symbol}: `);
    const maxAmount = await this.rl.question(`Maximum amount ${symbol}: `);
    
    if (isNaN(minAmount) || isNaN(maxAmount) || 
        parseFloat(minAmount) <= 0 || parseFloat(maxAmount) <= 0 || 
        parseFloat(maxAmount) < parseFloat(minAmount)) {
      throw new Error('Error: Invalid transfer amount range');
    }

    return { minAmount, maxAmount };
  }

  async confirmMainnetTransfer(chainName) {
    const confirm = await this.rl.question(`\nWarning: You are about to make transfers on ${chainName} MAINNET. Type 'CONFIRM' to continue: `);
    return confirm === 'CONFIRM';
  }

  async getWalletCount() {
    const walletCount = await this.rl.question('\nEnter the number of wallets to generate: ');
    const numWallets = parseInt(walletCount);
    
    if (isNaN(numWallets) || numWallets <= 0) {
      throw new Error('Error: Please enter a valid number of wallets (positive number)');
    }
    return numWallets;
  }

  async getRecipientAddress() {
    return await this.rl.question('\nEnter destination address (0x...): ');
  }

  close() {
    this.rl.close();
  }
}

export default CLI;