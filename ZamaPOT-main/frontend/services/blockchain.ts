import { ethers } from 'ethers';

// Use your actual deployed contract address
const CONTRACT_ADDRESS = "0x67009a1bABBF0bc56F56870C7c1f7295c15a2A2d";

// Enhanced ABI with only essential functions for connection test
const CONTRACT_ABI = [
  // Core functions
  "function mintTalentBadge(string,bytes32,uint8,string,uint8,bool,uint256,uint256) payable returns (uint256)",
  "function getUserBadges(address) view returns (uint256[])",
  "function tokenURI(uint256) view returns (string)",
  
  // Constants for connection test
  "function MINT_FEE() view returns (uint256)",
  "function owner() view returns (address)",
  
  // Events
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
   * Connect to MetaMask wallet and initialize the contract
   */
  async connectWallet(): Promise<string> {
    try {
      console.log("🔗 Starting wallet connection...");

      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error("MetaMask not installed. Please install MetaMask to use this feature.");
      }

      // Check if we're on Sepolia network
      await this.checkNetwork();

      // Create provider and request account access
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Request account access
      console.log("📝 Requesting account access...");
      const accounts = await this.provider.send("eth_requestAccounts", []);
      
      if (accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.");
      }
      
      // Get signer
      this.signer = this.provider.getSigner();
      const address = await this.signer.getAddress();
      
      console.log("✅ Account connected:", address);

      // Initialize contract with better error handling
      await this.initializeContract();
      
      this.isConnected = true;
      
      console.log("🎉 Wallet connection successful!");
      console.log("📝 Contract address:", CONTRACT_ADDRESS);
      
      return address;
      
    } catch (error: any) {
      console.error("❌ Wallet connection failed:", error);
      
      // Reset connection state
      this.provider = null;
      this.signer = null;
      this.contract = null;
      this.isConnected = false;

      // User-friendly error messages
      if (error.code === 4001) {
        throw new Error("Connection rejected. Please connect your wallet to continue.");
      } else if (error.code === -32002) {
        throw new Error("Connection already pending. Please check MetaMask.");
      } else if (error.message?.includes('network')) {
        throw new Error("Please switch to Sepolia test network in MetaMask.");
      } else if (error.message?.includes('contract')) {
        throw new Error("Smart contract not found. Please check the contract address.");
      } else {
        throw new Error(`Connection failed: ${error.message}`);
      }
    }
  }

  /**
   * Check and switch to Sepolia network if needed
   */
  private async checkNetwork(): Promise<void> {
    if (!window.ethereum) return;

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Sepolia chain ID

    if (chainId !== SEPOLIA_CHAIN_ID) {
      console.log("🌐 Switching to Sepolia network...");
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
        console.log("✅ Switched to Sepolia network");
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          console.log("➕ Adding Sepolia network to MetaMask...");
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: SEPOLIA_CHAIN_ID,
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
            console.log("✅ Sepolia network added");
          } catch (addError) {
            throw new Error("Failed to add Sepolia network. Please add it manually to MetaMask.");
          }
        } else {
          throw new Error("Failed to switch to Sepolia network. Please switch manually.");
        }
      }
    } else {
      console.log("✅ Already on Sepolia network");
    }
  }

  /**
   * Initialize contract with better error handling
   */
  private async initializeContract(): Promise<void> {
    if (!this.signer) {
      throw new Error("Signer not available");
    }

    try {
      console.log("📦 Initializing smart contract...");
      
      // Create contract instance
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
      
      // Test contract connection by calling a simple view function
      console.log("🔍 Testing contract connection...");
      
      try {
        const mintFee = await this.contract.MINT_FEE();
        console.log("✅ Contract connection successful");
        console.log("💰 Mint fee:", ethers.utils.formatEther(mintFee), "ETH");
      } catch (contractError: any) {
        console.error("❌ Contract test failed:", contractError);
        
        if (contractError.message?.includes('call revert exception') || 
            contractError.message?.includes('invalid address')) {
          throw new Error(`Contract not found at address: ${CONTRACT_ADDRESS}. Please check the contract address.`);
        } else {
          throw new Error("Contract connection failed. The contract might not be deployed or ABI might be incorrect.");
        }
      }
      
    } catch (error: any) {
      console.error("❌ Contract initialization failed:", error);
      throw error;
    }
  }

  /**
   * Simple connection test without full initialization
   */
  async quickConnect(): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      // Quick account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      return accounts[0];
    } catch (error: any) {
      throw new Error(`Quick connect failed: ${error.message}`);
    }
  }

  /**
   * Get contract address for verification
   */
  getContractAddress(): string {
    return CONTRACT_ADDRESS;
  }

  /**
   * Verify contract is properly deployed on Etherscan
   */
  async verifyContractDeployment(): Promise<boolean> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    try {
      // Check if contract has code
      const code = await this.provider.getCode(CONTRACT_ADDRESS);
      const isDeployed = code !== '0x';
      
      console.log("📄 Contract code check:", isDeployed ? "Deployed" : "Not deployed");
      
      if (!isDeployed) {
        throw new Error("Contract not deployed at this address");
      }
      
      return true;
    } catch (error: any) {
      console.error("❌ Contract verification failed:", error);
      throw new Error(`Contract verification failed: ${error.message}`);
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): { connected: boolean; address: string | null; contract: boolean } {
    return {
      connected: this.isConnected,
      address: this.signer ? 'Available' : null,
      contract: this.contract !== null
    };
  }

  // ... rest of your existing methods (mintTalentBadge, getUserBadges, etc.)
}

export const blockchainService = new BlockchainService();
