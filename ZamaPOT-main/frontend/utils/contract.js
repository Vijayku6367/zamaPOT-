import { ethers } from 'ethers';

// New contract address
const CONTRACT_ADDRESS = "0x67009a1bABBF0bc56F56870C7c1f7295c15a2A2d";

const CONTRACT_ABI = [
  "function mintTalentBadge(string,bytes32,uint8,string,uint8,bool,uint256,uint256) payable returns (uint256)",
  "function MINT_FEE() view returns (uint256)"
];

export const mintNFTCertificate = async (skill, score) => {
  try {
    if (!window.ethereum) {
      throw new Error("Please install MetaMask");
    }

    // Network check
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0xaa36a7') {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    const mintFee = await contract.MINT_FEE();
    
    // FIX: Proper bytes32 format - exactly 32 bytes
    const encryptedProof = "0x" + "0".repeat(64); // 32 bytes of zeros
    
    const tx = await contract.mintTalentBadge(
      skill,                    // string
      encryptedProof,           // bytes32 (fixed)
      Math.min(Math.floor(score / 25), 4), // uint8 (0-4)
      `cert_${Date.now()}`,     // string
      0,                        // uint8 cheating likelihood
      false,                    // bool behavior flagged
      Math.floor(Date.now() / 1000), // uint256 timestamp
      Math.floor(Date.now() / 1000) + 31536000, // uint256 expiry
      { value: mintFee }
    );
    
    const receipt = await tx.wait();
    
    return {
      hash: tx.hash,
      success: true,
      message: "🎉 Talent Badge successfully minted on Sepolia!",
      tokenId: `Token #${receipt.logs[0]?.topics[3] ? parseInt(receipt.logs[0].topics[3]) : 'Unknown'}`
    };
    
  } catch (error) {
    console.error("Transaction error:", error);
    
    if (error.code === 'ACTION_REJECTED') {
      throw new Error("Transaction was rejected by user.");
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error("Insufficient funds for gas fee.");
    } else {
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }
};

export const getMintFee = async () => {
  try {
    if (!window.ethereum) return "0.001";
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const fee = await contract.MINT_FEE();
    return ethers.formatEther(fee);
  } catch (error) {
    return "0.001";
  }
};

// Test contract connection
export const testContractConnection = async () => {
  try {
    if (!window.ethereum) return { connected: false, error: "MetaMask not installed" };
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const owner = await contract.owner();
    const mintFee = await contract.MINT_FEE();
    
    return {
      connected: true,
      owner: owner,
      mintFee: ethers.formatEther(mintFee),
      network: "Sepolia"
    };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};
