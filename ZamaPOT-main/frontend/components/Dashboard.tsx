'use client';
import { useState, useEffect } from 'react';
import { blockchainService } from '../services/blockchain';

interface UserStats {
  totalNFTs: number;
  skillDistribution: { [key: string]: number };
  averageLevel: number;
  totalEarned: number;
}

export default function Dashboard({ address }: { address: string }) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [nfts, setNfts] = useState<any[]>([]);

  useEffect(() => {
    if (address) {
      loadDashboardData();
    }
  }, [address]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const badgeIds = await blockchainService.getUserBadges(address);
      
      const nftData = await Promise.all(
        badgeIds.map(async (tokenId) => {
          try {
            const metadata = await blockchainService.getTokenMetadata(tokenId);
            return { tokenId, metadata };
          } catch (error) {
            return null;
          }
        })
      );

      const validNfts = nftData.filter(Boolean);
      setNfts(validNfts);

      const skillDistribution: { [key: string]: number } = {};
      let totalLevel = 0;

      validNfts.forEach((nft: any) => {
        const skillType = nft.metadata.attributes.find((attr: any) => attr.trait_type === "Skill Type")?.value || "Unknown";
        const level = parseInt(nft.metadata.attributes.find((attr: any) => attr.trait_type === "Level")?.value?.match(/\d+/)?.[0] || "1");
        
        skillDistribution[skillType] = (skillDistribution[skillType] || 0) + 1;
        totalLevel += level;
      });

      setStats({
        totalNFTs: validNfts.length,
        skillDistribution,
        averageLevel: validNfts.length > 0 ? totalLevel / validNfts.length : 0,
        totalEarned: validNfts.length * 0.001
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
        <p>Loading your talent analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: 'white', marginBottom: '10px' }}>📊 Talent Analytics</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Your private skill verification dashboard</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎯</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Total Skills</h3>
          <p style={{ fontSize: '2rem', margin: 0, color: '#667eea', fontWeight: 'bold' }}>
            {stats?.totalNFTs || 0}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>⭐</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Average Level</h3>
          <p style={{ fontSize: '2rem', margin: 0, color: '#4CAF50', fontWeight: 'bold' }}>
            {stats?.averageLevel.toFixed(1) || '0.0'}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>💰</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Total Value</h3>
          <p style={{ fontSize: '2rem', margin: 0, color: '#FF6B35', fontWeight: 'bold' }}>
            {stats?.totalEarned.toFixed(3)} ETH
          </p>
        </div>
      </div>

      {stats && Object.keys(stats.skillDistribution).length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '40px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Skill Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {Object.entries(stats.skillDistribution).map(([skill, count]) => (
              <div key={skill}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '5px'
                }}>
                  <span style={{ color: '#555', fontWeight: 'bold' }}>{skill}</span>
                  <span style={{ color: '#667eea' }}>{count} skill{count !== 1 ? 's' : ''}</span>
                </div>
                <div style={{
                  background: '#f0f0f0',
                  borderRadius: '10px',
                  height: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    height: '100%',
                    width: `${(count / stats.totalNFTs) * 100}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Recent Talent NFTs</h3>
        {nfts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
            <p>Complete assessments to build your talent portfolio!</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {nfts.slice(0, 6).map((nft) => (
              <div 
                key={nft.tokenId}
                style={{
                  border: '2px solid #f0f0f0',
                  borderRadius: '10px',
                  padding: '15px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div 
                  style={{ 
                    width: '100%', 
                    height: '120px',
                    background: `url("${nft.metadata.image}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }}
                />
                <p style={{ 
                  margin: '0 0 5px 0', 
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  {nft.metadata.name}
                </p>
                <p style={{ 
                  margin: 0,
                  fontSize: '12px',
                  color: '#666'
                }}>
                  Level: {nft.metadata.attributes.find((attr: any) => attr.trait_type === "Level")?.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
