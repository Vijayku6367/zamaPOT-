'use client';
import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  address: string;
  totalSkills: number;
  averageLevel: number;
  totalValue: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockLeaderboard: LeaderboardEntry[] = [
      { address: "0x742...d35a", totalSkills: 12, averageLevel: 4.2, totalValue: 0.012 },
      { address: "0x8f3...b92c", totalSkills: 8, averageLevel: 3.8, totalValue: 0.008 },
      { address: "0x3a9...7e1d", totalSkills: 6, averageLevel: 4.5, totalValue: 0.006 },
      { address: "0xbe7...ec0c", totalSkills: 3, averageLevel: 3.0, totalValue: 0.003 },
      { address: "0x1c4...9f2a", totalSkills: 2, averageLevel: 2.5, totalValue: 0.002 },
    ];

    setTimeout(() => {
      setLeaderboard(mockLeaderboard);
      setLoading(false);
    }, 1000);
  }, []);

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏆</div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: 'white', marginBottom: '10px' }}>🏆 Talent Leaderboard</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Top skill verifiers on the platform</p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '50px 1fr 100px 100px 100px',
          gap: '20px',
          padding: '15px 0',
          borderBottom: '2px solid #f0f0f0',
          fontWeight: 'bold',
          color: '#333'
        }}>
          <div>#</div>
          <div>Address</div>
          <div style={{ textAlign: 'center' }}>Skills</div>
          <div style={{ textAlign: 'center' }}>Level</div>
          <div style={{ textAlign: 'center' }}>Value</div>
        </div>

        {leaderboard.map((entry, index) => (
          <div 
            key={entry.address}
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '50px 1fr 100px 100px 100px',
              gap: '20px',
              padding: '20px 0',
              borderBottom: index < leaderboard.length - 1 ? '1px solid #f0f0f0' : 'none',
              alignItems: 'center'
            }}
          >
            <div style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: index < 3 ? '#FF6B35' : '#666'
            }}>
              {index + 1}
            </div>
            <div style={{ 
              fontFamily: 'monospace',
              color: '#333'
            }}>
              {shortenAddress(entry.address)}
            </div>
            <div style={{ textAlign: 'center', color: '#667eea', fontWeight: 'bold' }}>
              {entry.totalSkills}
            </div>
            <div style={{ textAlign: 'center', color: '#4CAF50', fontWeight: 'bold' }}>
              {entry.averageLevel.toFixed(1)}
            </div>
            <div style={{ textAlign: 'center', color: '#FF6B35', fontWeight: 'bold' }}>
              {entry.totalValue} ETH
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '10px', 
        padding: '20px', 
        marginTop: '30px',
        textAlign: 'center',
        color: 'white'
      }}>
        <p style={{ margin: 0 }}>
          🔒 <strong>Privacy First:</strong> Leaderboard shows only public on-chain data. 
          Your actual answers and scores remain encrypted and private.
        </p>
      </div>
    </div>
  );
}
