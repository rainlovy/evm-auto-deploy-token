import dotenv from 'dotenv';
import { walletConfig } from '../config/index.js';
import path from 'path';
import WalletManager from './WalletManager.js';
import TransferService from './TransferService.js';
import CLI from './CLI.js';
import { ethers } from 'ethers';

dotenv.config({ path: path.resolve(process.cwd(), 'data/.env') });

import displayHeader from './displayHeader.js';

async function main() {
  try {
    displayHeader();
    const cli = new CLI();
    const chain = await cli.selectChain();
    const walletManager = new WalletManager(chain);
    await walletManager.initializeWallet(walletConfig.privateKey);
    const transferService = new TransferService(walletManager, walletConfig);

    const option = await cli.selectOperation();
    const amount = await cli.getTransferAmount(chain.symbol);

    const currentBalance = await walletManager.getBalance(walletManager.wallet.address);
    console.log(`\nBalance saat ini: ${currentBalance} ${chain.symbol}`);

    switch(option) {
      case 1: // Transfer ke alamat dari wallet.txt
        const addresses = await walletManager.readWalletsFromFile('data/wallet.txt');
        if (addresses.length > 0) {
          const transferMode = await cli.getTransferMode();
          let minAmount, maxAmount, fixedAmount;

          if (transferMode === 1) {
            fixedAmount = amount;
            console.log(`\nAkan mentransfer ${fixedAmount} ${chain.symbol} ke setiap wallet`);
          } else {
            const range = await cli.getRandomAmountRange(chain.symbol);
            minAmount = range.minAmount;
            maxAmount = range.maxAmount;
          }

          if (chain.isMainnet && !await cli.confirmMainnetTransfer(chain.name)) {
            console.log('Transfer dibatalkan.');
            break;
          }

          let totalRequired = transferMode === 1 ? 
            parseFloat(fixedAmount) * addresses.length : 
            parseFloat(maxAmount) * addresses.length;

          if (parseFloat(currentBalance) < totalRequired) {
            console.log(`Error: Balance tidak cukup untuk melakukan semua transfer. Dibutuhkan: ${totalRequired} ${chain.symbol}`);
            break;
          }

          console.log('\nMemulai proses transfer ke multiple wallet...');
          let totalTransferred = 0;
          for (let i = 0; i < addresses.length; i++) {
            const transferAmount = transferMode === 1 ? fixedAmount : 
              (Math.random() * (parseFloat(maxAmount) - parseFloat(minAmount)) + parseFloat(minAmount)).toFixed(8);
            
            try {
              await transferService.transfer(addresses[i].address, transferAmount);
              console.log(`Sukses transfer ${transferAmount} ${chain.symbol} ke ${addresses[i].address}`);
              totalTransferred += parseFloat(transferAmount);
            } catch (error) {
              console.error(`Error saat transfer ke ${addresses[i].address}:`, error.message);
            }
          }

          console.log('\nRingkasan Transfer:');
          console.log(`Total amount transferred: ${totalTransferred.toFixed(8)} ${chain.symbol}`);
        } else {
          console.log('Tidak ada alamat yang ditemukan di wallet.txt');
        }
        break;

      case 2: // Generate wallet baru
        const numWallets = await cli.getWalletCount();
        const transferMode = await cli.getTransferMode();
        let minAmount, maxAmount, fixedAmount;

        if (transferMode === 1) {
          fixedAmount = amount;
          console.log(`\nAkan mentransfer ${fixedAmount} ${chain.symbol} ke setiap wallet`);
        } else {
          const range = await cli.getRandomAmountRange(chain.symbol);
          minAmount = range.minAmount;
          maxAmount = range.maxAmount;
        }

        try {
          console.log('\nMemulai proses generate wallet dan transfer...');
          const wallets = await transferService.batchTransfer(numWallets, fixedAmount, minAmount, maxAmount);
          console.log('\nProses selesai! Semua wallet telah disimpan di data/generated_wallets.txt');
          
          console.log('\nRingkasan Transfer:');
          let totalTransferred = 0;
          wallets.forEach(({ wallet, amount }, index) => {
            console.log(`Wallet ${index + 1}: ${wallet.address}`);
            console.log(`Amount: ${amount} ${chain.symbol}\n`);
            totalTransferred += parseFloat(amount);
          });
          console.log(`Total amount transferred: ${totalTransferred.toFixed(8)} ${chain.symbol}`);
        } catch (error) {
          console.error('Error:', error.message);
        }
        break;

      case 3: // Transfer ke alamat manual
        const recipientAddress = await cli.getRecipientAddress();
        if (!ethers.isAddress(recipientAddress)) {
          console.log('Alamat tidak valid!');
          break;
        }
        
        if (chain.isMainnet && !await cli.confirmMainnetTransfer(chain.name)) {
          console.log('Transfer dibatalkan.');
          break;
        }
        await transferService.transfer(recipientAddress, amount);
        break;
    }

    cli.close();

  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();