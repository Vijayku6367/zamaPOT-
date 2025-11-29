'use client';
import { useState, useEffect } from 'react';
import { MobileFHEEncryptor } from "../utils/encryption";
import { blockchainService } from '../services/blockchain';
import WalletConnect from './WalletConnect';

interface DynamicQuestion {
  question_id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  parameters: { [key: string]: string };
  difficulty: number;
  expected_time: number;
}

interface BehaviorData {
  answer_times: number[];
  switch_counts: number[];
  start_time: number;
  end_time: number;
}

export default function EnhancedQuiz({ quizType, onComplete }: { quizType: string; onComplete: () => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [questions, setQuestions] = useState<DynamicQuestion[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  
  // Behavior tracking
  const [questionStartTimes, setQuestionStartTimes] = useState<number[]>([]);
  const [switchCounts, setSwitchCounts] = useState<number[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  useEffect(() => {
    const newUserId = MobileFHEEncryptor.generateUserId();
    setUserId(newUserId);
    initializeSession(newUserId);
    setSessionStartTime(Date.now());
  }, [quizType]);

  const initializeSession = async (user_id: string) => {
    try {
      const response = await fetch('http://localhost:8080/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id,
          quiz_type: quizType
        }),
      });

      if (!response.ok) throw new Error('Failed to create session');
      
      const data = await response.json();
      setSessionId(data.session_id);
      setQuestions(data.questions);
      setCurrentQuestion(0);
      setAnswers([]);
      setResult(null);
      setMintedTokenId(null);
      
      // Initialize behavior tracking arrays
      setQuestionStartTimes(Array(data.questions.length).fill(0));
      setSwitchCounts(Array(data.questions.length).fill(0));
      
      // Start timing for first question
      const newStartTimes = [...questionStartTimes];
      newStartTimes[0] = Date.now();
      setQuestionStartTimes(newStartTimes);
      
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    
    // Track answer switching
    if (newAnswers[currentQuestion] !== undefined && newAnswers[currentQuestion] !== answerIndex) {
      const newSwitchCounts = [...switchCounts];
      newSwitchCounts[currentQuestion] = (newSwitchCounts[currentQuestion] || 0) + 1;
      setSwitchCounts(newSwitchCounts);
    }
    
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      // Record time spent on current question
      const timeSpent = Math.floor((Date.now() - questionStartTimes[currentQuestion]) / 1000);
      
      // Move to next question and start its timer
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        const newStartTimes = [...questionStartTimes];
        newStartTimes[currentQuestion + 1] = Date.now();
        setQuestionStartTimes(newStartTimes);
      }, 500);
    }
  };

  const submitQuiz = async () => {
    if (answers.length < questions.length) {
      alert('Please answer all questions before submitting!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate final behavior data
      const answerTimes = questionStartTimes.map((startTime, index) => {
        if (index === questions.length - 1) {
          return Math.floor((Date.now() - startTime) / 1000);
        } else if (index < answers.length - 1) {
          return Math.floor((questionStartTimes[index + 1] - startTime) / 1000);
        }
        return 0;
      }).filter(time => time > 0);

      const behaviorData: BehaviorData = {
        answer_times: answerTimes,
        switch_counts: switchCounts,
        start_time: Math.floor(sessionStartTime / 1000),
        end_time: Math.floor(Date.now() / 1000)
      };

      const encryptedAnswers = MobileFHEEncryptor.encryptAnswers(answers);
      
      const response = await fetch('http://localhost:8080/evaluate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          encryptedAnswers, 
          user_id: sessionId,
          quiz_type: quizType,
          behavior_data: behaviorData
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      setResult(result);

    } catch (error) {
      console.error('❌ Error submitting quiz:', error);
      alert('Error submitting quiz. Make sure the FHE backend is running on port 8080.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mintNFT = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first!');
      return;
    }

    if (!result) {
      alert('No quiz result to mint!');
      return;
    }

    setIsMinting(true);

    try {
      const tokenId = await blockchainService.mintTalentBadge(
        result.quiz_type,
        result.encrypted_score,
        result.level,
        result.certificate_id,
        Math.round(result.cheating_likelihood * 100),
        result.is_flagged,
        result.total_questions,
        result.correct_answers
      );

      setMintedTokenId(tokenId);
      console.log('🎉 NFT minted successfully! Token ID:', tokenId);

    } catch (error: any) {
      console.error('❌ NFT minting failed:', error);
      alert(`Minting failed: ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  const viewOnExplorer = () => {
    if (mintedTokenId !== null) {
      window.open(`https://sepolia.etherscan.io/token/0x7F756eA338dE78078a88e6D174bE18916a5c2dE0?a=${mintedTokenId}`, '_blank');
    }
  };

  const restartQuiz = () => {
    initializeSession(userId);
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <p>Loading dynamic assessment...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* Wallet Connection */}
      <WalletConnect onConnect={handleWalletConnect} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: 'white', marginBottom: '10px', fontSize: '2rem' }}>
          {quizType === 'programming' ? '💻 Programming Assessment' : 
           quizType === 'math' ? '🧮 Math Assessment' : 
           quizType === 'blockchain' ? '🔗 Blockchain Assessment' :
           quizType === 'security' ? '🛡️ Security Assessment' : '🎯 Skill Assessment'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Dynamic questions • Behavior analysis • Anti-cheating</p>
        <div style={{ 
          background: 'rgba(255,255,255,0.2)', 
          borderRadius: '10px', 
          padding: '10px', 
          marginTop: '10px',
          fontSize: '12px',
          fontFamily: 'monospace',
          color: 'white'
        }}>
          User: {userId} | Session: {sessionId.substring(0, 8)}... | 
          Wallet: {walletAddress ? '✅ Connected' : '❌ Not Connected'}
        </div>
      </div>

      {!result ? (
        <>
          {/* Progress Bar */}
          <div style={{ 
            background: 'rgba(255,255,255,0.3)', 
            borderRadius: '10px', 
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: '#4CAF50', 
              height: '8px', 
              width: `${progress}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Question Card */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>
                Question {currentQuestion + 1} of {questions.length}
              </h3>
              <div style={{ 
                background: '#f0f0f0',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#666'
              }}>
                ⏱️ {questions[currentQuestion]?.expected_time}s expected
              </div>
            </div>
            
            <p style={{ 
              fontSize: '18px', 
              marginBottom: '25px',
              lineHeight: '1.5',
              color: '#555'
            }}>
              {questions[currentQuestion]?.question_text}
            </p>
            
            {/* Question Parameters */}
            {Object.keys(questions[currentQuestion]?.parameters || {}).length > 0 && (
              <div style={{ 
                background: '#e3f2fd',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                color: '#1976d2'
              }}>
                <strong>Parameters:</strong> {JSON.stringify(questions[currentQuestion].parameters)}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questions[currentQuestion]?.options.map((option: string, index: number) => (
                <button 
                  key={index}
                  onClick={() => handleAnswer(index)}
                  style={{
                    padding: '15px',
                    border: answers[currentQuestion] === index ? '2px solid #4CAF50' : '2px solid #e0e0e0',
                    borderRadius: '10px',
                    background: answers[currentQuestion] === index ? '#f0f9f0' : 'white',
                    cursor: 'pointer',
                    fontSize: '16px',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    color: '#333'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Behavior Tracking Info */}
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '10px', 
            padding: '15px',
            marginBottom: '20px',
            color: 'white',
            fontSize: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>🔒 Behavior tracking active</span>
              <span>🛡️ Anti-cheating enabled</span>
              <span>📊 {switchCounts[currentQuestion] || 0} switches</span>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {currentQuestion > 0 && (
              <button 
                onClick={() => {
                  setCurrentQuestion(currentQuestion - 1);
                  const newStartTimes = [...questionStartTimes];
                  newStartTimes[currentQuestion - 1] = Date.now();
                  setQuestionStartTimes(newStartTimes);
                }}
                style={{
                  padding: '12px 24px',
                  border: '2px solid rgba(255,255,255,0.5)',
                  background: 'transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                ← Previous
              </button>
            )}
            
            {currentQuestion === questions.length - 1 && (
              <button 
                onClick={submitQuiz}
                disabled={isSubmitting}
                style={{
                  padding: '12px 24px',
                  background: isSubmitting ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {isSubmitting ? '🔄 Analyzing Behavior...' : '🔐 Submit Encrypted Answers'}
              </button>
            )}
          </div>
        </>
      ) : (
        /* Results Screen with Behavior Analysis */
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>
            {result.passed && !result.is_flagged ? '🎉' : 
             result.is_flagged ? '🚩' : '📝'}
          </div>
          
          <h2 style={{ 
            color: result.is_flagged ? '#FF6B35' : 
                   result.passed ? '#4CAF50' : '#2196F3',
            marginBottom: '15px'
          }}>
            {result.is_flagged ? 'Assessment Flagged' : 
             result.passed ? 'Assessment PASSED!' : 'Assessment Completed'}
          </h2>
          
          {result.is_flagged && (
            <div style={{
              background: '#fff3e0',
              border: '2px solid #FF6B35',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0, color: '#e65100', fontWeight: 'bold' }}>
                ⚠️ This assessment has been flagged for suspicious behavior patterns.
                Cheating likelihood: {(result.cheating_likelihood * 100).toFixed(1)}%
              </p>
            </div>
          )}
          
          <div style={{ 
            background: '#f8f9fa', 
            borderRadius: '10px', 
            padding: '20px',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '18px', margin: '10px 0' }}>
              <strong>Score:</strong> {result.correct_answers}/{result.total_questions} correct
            </p>
            <p style={{ fontSize: '16px', margin: '10px 0', color: '#666' }}>
              <strong>Skill Level:</strong> {result.level}/5
            </p>
            <p style={{ fontSize: '14px', margin: '10px 0', color: '#666' }}>
              <strong>Quiz Type:</strong> {result.quiz_type}
            </p>
            
            {/* Behavior Analysis */}
            <div style={{ 
              background: '#e9ecef', 
              borderRadius: '8px', 
              padding: '15px',
              margin: '15px 0'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Behavior Analysis</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                <div>Avg Time: {result.behavior_analysis.average_time.toFixed(1)}s</div>
                <div>Consistency: {(result.behavior_analysis.time_consistency * 100).toFixed(1)}%</div>
                <div>Switches: {result.behavior_analysis.switch_frequency.toFixed(1)}</div>
                <div>Pattern: {(result.behavior_analysis.pattern_deviation * 100).toFixed(1)}%</div>
              </div>
            </div>
            
            <p style={{ 
              fontSize: '12px', 
              margin: '10px 0', 
              fontFamily: 'monospace',
              background: '#e9ecef',
              padding: '10px',
              borderRadius: '5px',
              wordBreak: 'break-all'
            }}>
              🔒 Encrypted Score: {result.encrypted_score}
            </p>
            <p style={{ 
              fontSize: '12px', 
              margin: '10px 0', 
              fontFamily: 'monospace',
              background: '#e3f2fd',
              padding: '10px',
              borderRadius: '5px'
            }}>
              📜 Certificate ID: {result.certificate_id}
            </p>
          </div>

          {result.passed && !result.is_flagged && (
            <div>
              {!mintedTokenId ? (
                <div>
                  <div style={{
                    background: '#e8f5e8',
                    border: '2px solid #4CAF50',
                    borderRadius: '10px',
                    padding: '15px',
                    marginBottom: '20px'
                  }}>
                    <p style={{ margin: 0, color: '#2e7d32' }}>
                      ✅ Clean assessment! Your behavior analysis shows genuine performance.
                      Cheating likelihood: {(result.cheating_likelihood * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <button 
                    onClick={mintNFT}
                    disabled={isMinting || !walletAddress}
                    style={{
                      padding: '15px 30px',
                      background: isMinting ? '#ccc' : '#FF6B35',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: (isMinting || !walletAddress) ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      marginBottom: '10px'
                    }}
                  >
                    {isMinting ? '🔄 Minting NFT...' : '🎨 Mint Verified Talent NFT (0.001 ETH)'}
                  </button>
                  
                  {!walletAddress && (
                    <p style={{ color: '#f44336', fontSize: '14px' }}>
                      Please connect your wallet to mint NFT
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{
                    background: '#e8f5e8',
                    border: '2px solid #4CAF50',
                    borderRadius: '10px',
                    padding: '15px',
                    marginBottom: '20px'
                  }}>
                    <p style={{ margin: 0, color: '#2e7d32', fontSize: '18px' }}>
                      🎉 Verified Talent NFT Minted Successfully!
                    </p>
                    <p style={{ margin: '10px 0 0 0', color: '#2e7d32', fontSize: '14px' }}>
                      Token ID: #{mintedTokenId} | Cheating Score: {(result.cheating_likelihood * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <button 
                    onClick={viewOnExplorer}
                    style={{
                      padding: '12px 24px',
                      background: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      marginRight: '10px'
                    }}
                  >
                    🔍 View on Explorer
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <button 
              onClick={restartQuiz}
              style={{
                padding: '12px 24px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Retry This Quiz
            </button>
            <button 
              onClick={onComplete}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#2196F3',
                border: '2px solid #2196F3',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Choose Another Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
