import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x67009a1bABBF0bc56F56870C7c1f7295c15a2A2d";

const CONTRACT_ABI = [
  "function mintTalentBadge(string,bytes32,uint8,string,uint8,bool,uint256,uint256) payable returns (uint256)",
  "function getUserBadges(address) view returns (uint256[])",
  "function tokenURI(uint256) view returns (string)",
  "function getTalentRecord(uint256) view returns (string,bytes32,uint256,bool,uint8,string,uint8,bool,uint256,uint256)",
  "function withdrawFees() external",
  "function MINT_FEE() view returns (uint256)",
  "event BadgeMinted(address indexed user, uint256 tokenId, string skillType, uint8 level, string certificateId, uint8 cheatingLikelihood, bool behaviorFlagged, uint256 timestamp)",
  "function owner() view returns (address)",
  "function transferOwnership(address newOwner) external"
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface TalentRecord {
  skillType: string;
  encryptedScore: string;
  timestamp: number;
  verified: boolean;
  level: number;
  certificateId: string;
  cheatingLikelihood: number;
  behaviorFlagged: boolean;
  totalQuestions: number;
  correctAnswers: number;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: any;
    display_type?: string;
  }>;
}

export class BlockchainService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private isConnected: boolean = false;

  async connectWallet(): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed. Please install MetaMask to use this feature.");
      }

      console.log("🔗 Connecting to MetaMask...");

      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      await this.provider.send("eth_requestAccounts", []);
      this.signer = this.provider.getSigner();
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
      
      const address = await this.signer.getAddress();
      await this.verifyContractConnection();
      
      this.isConnected = true;
      
      console.log("✅ Wallet connected:", address);
      console.log("📝 Contract initialized:", CONTRACT_ADDRESS);
      
      return address;
      
    } catch (error: any) {
      console.error("❌ Wallet connection failed:", error);
      
      if (error.code === 4001) {
        throw new Error("Connection rejected by user. Please connect your wallet to continue.");
      } else if (error.code === -32002) {
        throw new Error("Wallet connection already pending. Please check your MetaMask.");
      } else {
        throw new Error(`Connection failed: ${error.message}`);
      }
    }
  }

  private async verifyContractConnection(): Promise<void> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const mintFee = await this.contract.MINT_FEE();
      console.log("✅ Contract verified. Mint fee:", ethers.utils.formatEther(mintFee));
    } catch (error) {
      console.error("❌ Contract verification failed:", error);
      throw new Error("Failed to connect to smart contract. Please check the contract address.");
    }
  }

  async mintTalentBadge(
    skillType: string,
    encryptedScore: string,
    level: number,
    certificateId: string,
    cheatingLikelihood: number,
    behaviorFlagged: boolean,
    totalQuestions: number,
    correctAnswers: number
  ): Promise<number> {
    if (!this.contract || !this.signer) {
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }

    try {
      console.log("🎨 Starting NFT minting process...");
      console.log("   Skill Type:", skillType);
      console.log("   Level:", level);
      console.log("   Cheating Likelihood:", cheatingLikelihood + "%");
      console.log("   Behavior Flagged:", behaviorFlagged);

      let scoreBytes32: string;
      
      if (encryptedScore.length <= 32) {
        scoreBytes32 = ethers.utils.hexZeroPad(
          ethers.utils.toUtf8Bytes(encryptedScore.padEnd(32, '\0')), 
          32
        );
      } else {
        scoreBytes32 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(encryptedScore));
      }

      console.log("   Encrypted Score (bytes32):", scoreBytes32);

      const mintFee = await this.contract.MINT_FEE();
      console.log("   Mint Fee:", ethers.utils.formatEther(mintFee), "ETH");

      const userBalance = await this.signer.getBalance();
      if (userBalance.lt(mintFee)) {
        throw new Error(`Insufficient balance. Required: ${ethers.utils.formatEther(mintFee)} ETH, Available: ${ethers.utils.formatEther(userBalance)} ETH`);
      }

      console.log("   User balance sufficient");

      console.log("⏳ Sending mint transaction...");
      
      const transaction = await this.contract.mintTalentBadge(
        skillType,
        scoreBytes32,
        level,
        certificateId,
        cheatingLikelihood,
        behaviorFlagged,
        totalQuestions,
        correctAnswers,
        { 
          value: mintFee,
          gasLimit: 500000
        }
      );

      console.log("📝 Transaction sent:", transaction.hash);
      console.log("⏳ Waiting for confirmation...");

      const receipt = await transaction.wait();
      console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

      const event = receipt.events?.find((event: any) => event.event === "BadgeMinted");
      
      if (event && event.args) {
        const tokenId = event.args.tokenId.toNumber();
        console.log("🎉 NFT minted successfully! Token ID:", tokenId);
        
        console.log("   Skill Type:", event.args.skillType);
        console.log("   Level:", event.args.level.toString());
        console.log("   Cheating Likelihood:", event.args.cheatingLikelihood.toString() + "%");
        console.log("   Behavior Flagged:", event.args.behaviorFlagged);
        
        return tokenId;
      } else {
        throw new Error("Minting completed but no BadgeMinted event found");
      }

    } catch (error: any) {
      console.error("❌ NFT minting failed:", error);
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error("Insufficient funds for transaction. Please add ETH to your wallet.");
      } else if (error.code === 'USER_REJECTED') {
        throw new Error("Transaction was rejected by user.");
      } else if (error.message?.includes('gas')) {
        throw new Error("Transaction failed due to gas issues. Please try again.");
      } else if (error.message?.includes('Score already used')) {
        throw new Error("This score has already been used to mint an NFT.");
      } else {
        throw new Error(`Minting failed: ${error.message}`);
      }
    }
  }

  async getUserBadges(address: string): Promise<number[]> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    try {
      console.log("📜 Fetching user badges for:", address);
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
      const badges = await contract.getUserBadges(address);
      
      const badgeIds = badges.map((badge: ethers.BigNumber) => badge.toNumber());
      console.log("✅ Found", badgeIds.length, "badges for user");
      
      return badgeIds;
      
    } catch (error: any) {
      console.error("❌ Failed to fetch user badges:", error);
      throw new Error(`Failed to fetch badges: ${error.message}`);
    }
  }

  async getTokenMetadata(tokenId: number): Promise<NFTMetadata> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    try {
      console.log("🖼️ Fetching metadata for token:", tokenId);
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
      const tokenURI = await contract.tokenURI(tokenId);
      
      if (!tokenURI.startsWith('data:application/json;base64,')) {
        throw new Error("Invalid token URI format");
      }
      
      const jsonBase64 = tokenURI.replace('data:application/json;base64,', '');
      const jsonString = atob(jsonBase64);
      const metadata = JSON.parse(jsonString);
      
      console.log("✅ Metadata fetched for token:", tokenId);
      return metadata;
      
    } catch (error: any) {
      console.error("❌ Failed to fetch token metadata:", error);
      
      if (error.message?.includes('Token does not exist')) {
        throw new Error(`Token #${tokenId} does not exist`);
      } else {
        throw new Error(`Failed to fetch metadata: ${error.message}`);
      }
    }
  }

  async getTalentRecord(tokenId: number): Promise<TalentRecord> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    try {
      console.log("📊 Fetching talent record for token:", tokenId);
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
      const record = await contract.getTalentRecord(tokenId);
      
      const talentRecord: TalentRecord = {
        skillType: record[0],
        encryptedScore: record[1],
        timestamp: record[2].toNumber(),
        verified: record[3],
        level: record[4],
        certificateId: record[5],
        cheatingLikelihood: record[6],
        behaviorFlagged: record[7],
        totalQuestions: record[8].toNumber(),
        correctAnswers: record[9].toNumber()
      };
      
      console.log("✅ Talent record fetched for token:", tokenId);
      return talentRecord;
      
    } catch (error: any) {
      console.error("❌ Failed to fetch talent record:", error);
      throw new Error(`Failed to fetch talent record: ${error.message}`);
    }
  }

  async getMintFee(): Promise<string> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
      const mintFee = await contract.MINT_FEE();
      return ethers.utils.formatEther(mintFee);
    } catch (error: any) {
      console.error("❌ Failed to fetch mint fee:", error);
      throw new Error(`Failed to fetch mint fee: ${error.message}`);
    }
  }

  async getContractOwner(): Promise<string> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
      return await contract.owner();
    } catch (error: any) {
      console.error("❌ Failed to fetch contract owner:", error);
      throw new Error(`Failed to fetch contract owner: ${error.message}`);
    }
  }

  getContractAddress(): string {
    return CONTRACT_ADDRESS;
  }

  getContract(): ethers.Contract | null {
    return this.contract;
  }

  getEtherscanTokenUrl(tokenId: number): string {
    return `https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${tokenId}`;
  }

  isWalletConnected(): boolean {
    return this.isConnected && !!this.signer && !!this.contract;
  }

  async getCurrentAddress(): Promise<string | null> {
    if (!this.signer) {
      return null;
    }

    try {
      return await this.signer.getAddress();
    } catch (error) {
      console.error("❌ Failed to get current address:", error);
      return null;
    }
  }

  async getNetworkInfo(): Promise<{ chainId: number; name: string }> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: network.chainId,
        name: network.name
      };
    } catch (error: any) {
      console.error("❌ Failed to get network info:", error);
      throw new Error(`Failed to get network info: ${error.message}`);
    }
  }

  onAccountChange(callback: (accounts: string[]) => void): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  onChainChange(callback: (chainId: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }

  removeAllListeners(): void {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }

  async switchToSepoliaNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed");
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Test Network',
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                nativeCurrency: {
                  name: 'Sepolia Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          throw new Error("Failed to add Sepolia network to MetaMask");
        }
      } else {
        throw new Error("Failed to switch to Sepolia network");
      }
    }
  }

  async getTransactionHistory(address: string, limit: number = 10): Promise<any[]> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    try {
      console.log("📜 Fetching transaction history for:", address);
      
      return [
        {
          hash: "0x...",
          blockNumber: 0,
          timestamp: Date.now() - 86400000,
          from: address,
          to: CONTRACT_ADDRESS,
          value: "0.001 ETH",
          type: "NFT Mint"
        }
      ];
      
    } catch (error: any) {
      console.error("❌ Failed to fetch transaction history:", error);
      throw new Error(`Failed to fetch transaction history: ${error.message}`);
    }
  }

  static isValidAddress(address: string): boolean {
    try {
      return ethers.utils.isAddress(address);
    } catch {
      return false;
    }
  }

  static shortenAddress(address: string, chars: number = 4): string {
    if (!this.isValidAddress(address)) {
      return "Invalid Address";
    }
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
  }

  static formatETH(value: ethers.BigNumberish, decimals: number = 4): string {
    try {
      return parseFloat(ethers.utils.formatEther(value)).toFixed(decimals);
    } catch {
      return "0.0000";
    }
  }

  static getEtherscanTxUrl(txHash: string): string {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }

  static getEtherscanAddressUrl(address: string): string {
    return `https://sepolia.etherscan.io/address/${address}`;
  }

  static getEtherscanTokenUrl(tokenId: number): string {
    return `https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${tokenId}`;
  }

  disconnect(): void {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
    this.removeAllListeners();
    console.log("🔌 Wallet disconnected");
  }
}

export const blockchainService = new BlockchainService();

export const blockchainUtils = {
  isValidAddress: BlockchainService.isValidAddress,
  shortenAddress: BlockchainService.shortenAddress,
  formatETH: BlockchainService.formatETH,
  getEtherscanTxUrl: BlockchainService.getEtherscanTxUrl,
  getEtherscanAddressUrl: BlockchainService.getEtherscanAddressUrl,
  getEtherscanTokenUrl: BlockchainService.getEtherscanTokenUrl,
};

export default blockchainService;
