import { ethers } from 'ethers';

// Use your actual deployed contract address
const CONTRACT_ADDRESS = "0x67009a1bABBF0bc56F56870C7c1f7295c15a2A2d";

// Enhanced ABI with only essential functions
const CONTRACT_ABI = [
  "function mintTalentBadge(string skillType, bytes32 encryptedScore, uint8 level, string certificateId, uint8 cheatingLikelihood, bool behaviorFlagged, uint256 timestamp, uint256 quizId) payable returns (uint256)",
  "function getUserBadges(address user) view returns (uint256[])",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function MINT_FEE() view returns (uint256)",
  "function owner() view returns (address)",
  "event BadgeMinted(address indexed user, uint256 tokenId, string skillType, uint8 level, string certificateId, uint8 cheatingLikelihood, bool behaviorFlagged, uint256 timestamp)"
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class BlockchainService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private isConnected: boolean = false;

  /**
   * Connect wallet
   */
  async connectWallet(): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      await this.checkNetwork();

      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await this.provider.send("eth_requestAccounts", []);

      if (accounts.length === 0) {
        throw new Error("Unlock your wallet");
      }

      this.signer = this.provider.getSigner();
      const address = await this.signer.getAddress();

      await this.initializeContract();

      this.isConnected = true;
      return address;
    } catch (error: any) {
      this.provider = null;
      this.signer = null;
      this.contract = null;
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Ensure Sepolia network
   */
  private async checkNetwork(): Promise<void> {
    const SEPOLIA_CHAIN_ID = "0xaa36a7";

    const chainId = await window.ethereum.request({
      method: "eth_chainId"
    });

    if (chainId !== SEPOLIA_CHAIN_ID) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    }
  }

  /**
   * Initialize contract
   */
  private async initializeContract(): Promise<void> {
    if (!this.signer) throw new Error("Signer not available");

    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      this.signer
    );

    try {
      await this.contract.MINT_FEE();
    } catch (e) {
      throw new Error("Contract connection failed (wrong address or ABI)");
    }
  }

  /**
   * ⭐ FIXED FUNCTION ⭐  
   * mintTalentBadge used by quiz.tsx
   */
  async mintTalentBadge(
    quizType: string,
    encryptedScore: string,
    level: number
  ): Promise<string> {
    if (!this.contract || !this.signer) {
      throw new Error("Wallet not connected");
    }

    const mintFee = await this.contract.MINT_FEE();

    // Dummy values for required ABI fields
    const certificateId = "default-cert";
    const cheatingLikelihood = 1;
    const behaviorFlagged = false;
    const timestamp = Math.floor(Date.now() / 1000);
    const quizId = 1;

    const tx = await this.contract.mintTalentBadge(
      quizType,
      encryptedScore,
      level,
      certificateId,
      cheatingLikelihood,
      behaviorFlagged,
      timestamp,
      quizId,
      { value: mintFee }
    );

    const receipt = await tx.wait();
    const event = receipt.events?.find((e: any) => e.event === "BadgeMinted");

    return event?.args?.tokenId?.toString() || "0";
  }

  /**
   * Get user badges
   */
  async getUserBadges(address: string): Promise<number[]> {
    if (!this.contract) throw new Error("Contract not initialized");

    const badges = await this.contract.getUserBadges(address);
    return badges.map((b: any) => Number(b));
  }

  /**
   * Quick connect
   */
  async quickConnect(): Promise<string> {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });
    return accounts[0];
  }

  getContractAddress(): string {
    return CONTRACT_ADDRESS;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      address: this.signer ? "Available" : null,
      contract: this.contract !== null
    };
  }
}

export const blockchainService = new BlockchainService();
