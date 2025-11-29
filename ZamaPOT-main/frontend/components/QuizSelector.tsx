'use client';
import { useState, useEffect } from 'react';

interface QuizType {
  name: string;
  description: string;
  difficulty: string;
  questions: number;
  category: string;
  estimatedTime: string;
  rewards: string[];
}

interface QuizStats {
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
}

export default function QuizSelector({ onSelectQuiz }: { onSelectQuiz: (quizType: string) => void }) {
  const [availableQuizzes, setAvailableQuizzes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<{ [key: string]: QuizStats }>({});

  const quizDetails: { [key: string]: QuizType } = {
    programming: {
      name: "Programming Fundamentals",
      description: "Test your knowledge of programming concepts, FHE, blockchain, and software development principles. Perfect for developers and tech enthusiasts.",
      difficulty: "Intermediate",
      questions: 5,
      category: "technology",
      estimatedTime: "5-7 minutes",
      rewards: ["Programming Expert NFT", "Skill Verification", "Level Badges"]
    },
    math: {
      name: "Mathematics & Logic", 
      description: "Sharpen your analytical skills with math problems, logical reasoning, and problem-solving challenges. Build your quantitative reasoning credentials.",
      difficulty: "Beginner",
      questions: 4,
      category: "academic",
      estimatedTime: "4-6 minutes",
      rewards: ["Math Pro NFT", "Logic Certification", "Score Ranking"]
    },
    blockchain: {
      name: "Blockchain & Web3",
      description: "Prove your understanding of blockchain technology, smart contracts, DeFi, NFTs, and the decentralized web. Essential for Web3 enthusiasts.",
      difficulty: "Intermediate",
      questions: 6,
      category: "technology",
      estimatedTime: "6-8 minutes",
      rewards: ["Web3 Pioneer NFT", "Blockchain Certification", "Gas Fee Discounts"]
    },
    security: {
      name: "Cyber Security",
      description: "Demonstrate your knowledge of online safety, encryption methods, security protocols, and privacy protection techniques. Critical for digital safety.",
      difficulty: "Advanced",
      questions: 5,
      category: "technology",
      estimatedTime: "5-7 minutes",
      rewards: ["Security Guardian NFT", "Privacy Certification", "Expert Status"]
    },
    design: {
      name: "UI/UX Design",
      description: "Showcase your understanding of user experience principles, design thinking, and interface best practices. For creators and designers.",
      difficulty: "Intermediate",
      questions: 4,
      category: "creative",
      estimatedTime: "4-6 minutes",
      rewards: ["Design Pro NFT", "UX Certification", "Portfolio Boost"]
    },
    business: {
      name: "Business Fundamentals",
      description: "Test your business acumen, strategic thinking, and understanding of market dynamics. Valuable for entrepreneurs and professionals.",
      difficulty: "Intermediate",
      questions: 5,
      category: "professional",
      estimatedTime: "5-7 minutes",
      rewards: ["Business Strategist NFT", "Professional Certification", "Network Access"]
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories', icon: '📚', count: Object.keys(quizDetails).length },
    { id: 'technology', name: 'Technology', icon: '💻', count: Object.values(quizDetails).filter(q => q.category === 'technology').length },
    { id: 'academic', name: 'Academic', icon: '🎓', count: Object.values(quizDetails).filter(q => q.category === 'academic').length },
    { id: 'creative', name: 'Creative', icon: '🎨', count: Object.values(quizDetails).filter(q => q.category === 'creative').length },
    { id: 'professional', name: 'Professional', icon: '💼', count: Object.values(quizDetails).filter(q => q.category === 'professional').length }
  ];

  const difficultyColors: { [key: string]: string } = {
    'Beginner': '#4CAF50',
    'Intermediate': '#FF9800',
    'Advanced': '#F44336'
  };

  useEffect(() => {
    fetchAvailableQuizzes();
    loadQuizStats();
  }, []);

  const fetchAvailableQuizzes = async () => {
    try {
      const response = await fetch('http://localhost:8080/quizzes');
      const quizzes = await response.json();
      setAvailableQuizzes(quizzes);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      // Fallback to all quizzes
      setAvailableQuizzes(Object.keys(quizDetails));
    } finally {
      setLoading(false);
    }
  };

  const loadQuizStats = () => {
    // Mock stats - in real app, this would come from your backend
    const mockStats: { [key: string]: QuizStats } = {
      programming: { totalAttempts: 1247, averageScore: 72, completionRate: 85 },
      math: { totalAttempts: 892, averageScore: 68, completionRate: 78 },
      blockchain: { totalAttempts: 567, averageScore: 65, completionRate: 72 },
      security: { totalAttempts: 234, averageScore: 58, completionRate: 65 },
      design: { totalAttempts: 456, averageScore: 71, completionRate: 82 },
      business: { totalAttempts: 378, averageScore: 69, completionRate: 76 }
    };
    setStats(mockStats);
  };

  const filteredQuizzes = availableQuizzes.filter(quizKey => {
    const quiz = quizDetails[quizKey];
    if (!quiz) return false;
    
    const matchesCategory = selectedCategory === 'all' || quiz.category === selectedCategory;
    const matchesSearch = quiz.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const getQuizIcon = (quizKey: string) => {
    const icons: { [key: string]: string } = {
      programming: '💻',
      math: '🧮',
      blockchain: '🔗',
      security: '🛡️',
      design: '🎨',
      business: '💼'
    };
    return icons[quizKey] || '🎯';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <p style={{ color: 'white' }}>Loading available quizzes...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: 'white', marginBottom: '10px', fontSize: '2.5rem' }}>🎯 Choose Your Talent Assessment</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>
          Prove your skills privately and mint verifiable talent NFTs
        </p>
      </div>

      {/* Search and Filter Section */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '15px', 
        padding: '25px',
        marginBottom: '30px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search quizzes by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '15px 15px 15px 45px',
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '16px'
              }}
            />
            <span style={{ 
              position: 'absolute', 
              left: '15px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.6)'
            }}>
              🔍
            </span>
          </div>
          
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '10px',
            borderRadius: '10px',
            color: 'white',
            fontSize: '14px'
          }}>
            <strong>{filteredQuizzes.length}</strong> quizzes available
          </div>
        </div>

        {/* Category Filters */}
        <div>
          <h3 style={{ color: 'white', marginBottom: '15px', fontSize: '1rem' }}>Filter by Category:</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '12px 20px',
                  background: selectedCategory === category.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: `2px solid ${selectedCategory === category.id ? '#667eea' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  padding: '2px 8px', 
                  borderRadius: '10px',
                  fontSize: '12px'
                }}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div style={{ 
        display: 'grid', 
        gap: '25px', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
      }}>
        {filteredQuizzes.map(quizKey => {
          const quiz = quizDetails[quizKey];
          const quizStat = stats[quizKey];

          return (
            <div 
              key={quizKey}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '25px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => onSelectQuiz(quizKey)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {/* Popular Badge */}
              {quizStat && quizStat.totalAttempts > 500 && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'linear-gradient(135deg, #FF6B35, #FF8E53)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  🔥 Popular
                </div>
              )}

              {/* Quiz Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  padding: '15px',
                  fontSize: '1.8rem'
                }}>
                  {getQuizIcon(quizKey)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    color: '#333',
                    fontSize: '1.3rem',
                    lineHeight: '1.3'
                  }}>
                    {quiz.name}
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: difficultyColors[quiz.difficulty],
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {quiz.difficulty}
                    </span>
                    
                    <span style={{
                      background: '#f0f0f0',
                      color: '#666',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}>
                      ⏱️ {quiz.estimatedTime}
                    </span>
                    
                    <span style={{
                      background: '#f0f0f0',
                      color: '#666',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}>
                      ❓ {quiz.questions} questions
                    </span>
                  </div>
                </div>
              </div>

              {/* Quiz Description */}
              <p style={{ 
                color: '#666', 
                marginBottom: '20px', 
                lineHeight: '1.6',
                fontSize: '14px'
              }}>
                {quiz.description}
              </p>

              {/* Stats Row */}
              {quizStat && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '15px',
                  marginBottom: '20px',
                  padding: '15px',
                  background: '#f8f9fa',
                  borderRadius: '10px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Attempts</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                      {quizStat.totalAttempts.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Avg Score</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4CAF50' }}>
                      {quizStat.averageScore}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Completion</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2196F3' }}>
                      {quizStat.completionRate}%
                    </div>
                  </div>
                </div>
              )}

              {/* Rewards Section */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>
                  🏆 Rewards:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {quiz.rewards.map((reward, index) => (
                    <span 
                      key={index}
                      style={{
                        background: '#e3f2fd',
                        color: '#1976d2',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        border: '1px solid #bbdefb'
                      }}
                    >
                      {reward}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button 
                style={{
                  width: '100%',
                  padding: '15px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Start Assessment
              </button>
            </div>
          );
        })}
      </div>

      {/* No Results Message */}
      {filteredQuizzes.length === 0 && (
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '15px', 
          padding: '60px 40px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
          <h3 style={{ marginBottom: '10px' }}>No quizzes found</h3>
          <p style={{ margin: 0, opacity: 0.8 }}>
            Try adjusting your search terms or category filters
          </p>
        </div>
      )}

      {/* Privacy Notice */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '10px', 
        padding: '25px', 
        marginTop: '40px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: 'white', marginBottom: '15px' }}>🔒 Privacy First Guarantee</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          color: 'rgba(255,255,255,0.8)'
        }}>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛡️</div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Encrypted Answers</div>
            <div style={{ fontSize: '14px' }}>Your responses are encrypted before leaving your device</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Private Evaluation</div>
            <div style={{ fontSize: '14px' }}>FHE computes your score without decrypting your data</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📜</div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>On-Chain Proof</div>
            <div style={{ fontSize: '14px' }}>Only your final score is recorded as verifiable NFT</div>
          </div>
        </div>
      </div>
    </div>
  );
}
