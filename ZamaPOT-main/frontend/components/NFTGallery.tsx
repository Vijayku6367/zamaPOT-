'use client';
import { useState, useEffect } from 'react';
import { blockchainService } from "../services/blockchain";
interface NFTData {
  tokenId: number;
  metadata: any;
  record: any;
}

export default function NFTGallery({ address }: { address: string }) {
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNft, setSelectedNft] = useState<NFTData | null>(null);

  useEffect(() => {
    if (address) {
      loadUserNFTs();
    }
  }, [address]);

  const loadUserNFTs = async () => {
    try {
      setLoading(true);
      const badgeIds = await blockchainService.getUserBadges(address);
      
      const nftData = await Promise.all(
        badgeIds.map(async (tokenId) => {
          try {
            const metadata = await blockchainService.getTokenMetadata(tokenId);
            return { tokenId, metadata };
          } catch (error) {
            console.error(`Error loading NFT ${tokenId}:`, error);
            return null;
          }
        })
      );

      setNfts(nftData.filter(Boolean) as NFTData[]);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <p>Loading your talent NFTs...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: 'white', marginBottom: '10px' }}>🎨 My Talent Collection</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>
          {nfts.length} verified skill{nfts.length !== 1 ? 's' : ''} on blockchain
        </p>
      </div>

      {nfts.length === 0 ? (
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '15px', 
          padding: '40px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎯</div>
          <h3>No NFTs Yet</h3>
          <p>Complete skill assessments to mint your talent NFTs!</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {nfts.map((nft) => (
            <div 
              key={nft.tokenId}
              style={{
                background: 'white',
                borderRadius: '15px',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setSelectedNft(nft)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
              }}
            >
              <div 
                style={{ 
                  width: '100%', 
                  height: '200px',
                  background: `url("${nft.metadata.image}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '10px',
                  marginBottom: '15px'
                }}
              />
              
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                {nft.metadata.name}
              </h3>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {nft.metadata.attributes.map((attr: any, index: number) => (
                  <span 
                    key={index}
                    style={{
                      background: '#f0f0f0',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#666'
                    }}
                  >
                    {attr.trait_type}: {attr.value}
                  </span>
                ))}
              </div>
              
              <button 
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginTop: '15px',
                  fontSize: '14px'
                }}
                       onClick={() => {
  const addr = blockchainService.getContractAddress();
  window.open(`https://sepolia.etherscan.io/token/${addr}?a=${selectedNft.tokenId}`, '_blank');
}}
              >
                🔍 View on Explorer
              </button>
            </div>
          ))}
        </div>
      )}

      {/* NFT Detail Modal */}
      {selectedNft && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#333' }}>{selectedNft.metadata.name}</h2>
              <button 
                onClick={() => setSelectedNft(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>
            
            <img 
              src={selectedNft.metadata.image} 
              alt={selectedNft.metadata.name}
              style={{
                width: '100%',
                borderRadius: '10px',
                marginBottom: '20px'
              }}
            />
            
            <p style={{ color: '#666', marginBottom: '20px' }}>
              {selectedNft.metadata.description}
            </p>
            
            <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '20px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Attributes</h4>
              {selectedNft.metadata.attributes.map((attr: any, index: number) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: index < selectedNft.metadata.attributes.length - 1 ? '1px solid #e0e0e0' : 'none'
                }}>
                  <span style={{ fontWeight: 'bold', color: '#555' }}>{attr.trait_type}:</span>
                  <span style={{ color: '#666' }}>{attr.value}</span>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                onClick={() => {
  const addr = blockchainService.getContractAddress();
  window.open(`https://sepolia.etherscan.io/token/${addr}?a=${selectedNft.tokenId}`, '_blank');
}}
              >
                🔍 View on Explorer
              </button>
              <button 
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  color: '#2196F3',
                  border: '2px solid #2196F3',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedNft(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
