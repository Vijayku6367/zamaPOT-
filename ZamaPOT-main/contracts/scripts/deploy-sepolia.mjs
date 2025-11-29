// scripts/deploy-sepolia.mjs
import hardhat from "hardhat";
import fs from 'fs';

const { ethers } = hardhat;

async function main() {
  console.log(" 🚀 Deploying EnhancedTalentPassport to Sepolia testnet...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get balance
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

  // Check if we have enough balance
  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    throw new Error("Insufficient balance for deployment. Get Sepolia ETH from faucet.");
  }

  console.log("Deploying EnhancedTalentPassport...");
  const TalentPassport = await ethers.getContractFactory("EnhancedTalentPassport");
  const talentPassport = await TalentPassport.deploy();

  // Wait for deployment
  await talentPassport.deployed();

  console.log(" ✅ EnhancedTalentPassport deployed to:", talentPassport.address);
  console.log(" 🔍 Explorer: https://sepolia.etherscan.io/address/" + talentPassport.address);

  // Save address to file
  fs.writeFileSync('../frontend/deployed-contract.txt', talentPassport.address);
  console.log(" 💾 Contract address saved to frontend/deployed-contract.txt");

  console.log(" 🎉 Deployment complete! Update your frontend with this address:", talentPassport.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
