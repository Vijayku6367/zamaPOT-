'use client';
import { MobileFHEEncryptor } from "../utils/encryption";
import { useState, useEffect } from 'react';

const quizData = {
  programming: [
    {
      id: 1,
      question: "What does FHE stand for in privacy technology?",
      options: [
        "Fully Homomorphic Encryption", 
        "Federated Hardware Encryption", 
        "Fast Hash Encryption",
        "Fixed Key Encryption"
      ],
      correct: 0
    },
    {
      id: 2, 
      question: "Which language is primarily used for FHE implementations?",
      options: [
        "Rust",
        "Python", 
        "JavaScript",
        "Java"
      ],
      correct: 0
    },
    {
      id: 3,
      question: "What is the main advantage of FHE?",
      options: [
        "Compute on encrypted data without decryption",
        "Faster encryption speed", 
        "Smaller encrypted data size",
        "Easier key management"
      ],
      correct: 0
    }
  ],
  math: [
    {
      id: 1,
      question: "What is 15 + 27?",
      options: ["42", "32", "52", "38"],
      correct: 0
    },
    {
      id: 2,
      question: "Solve: 8 × 7", 
      options: ["56", "54", "64", "49"],
      correct: 0
    },
    {
      id: 3,
      question: "What is 144 ÷ 12?",
      options: ["12", "11", "13", "14"],
      correct: 0
    }
  ]
};

interface QuizProps {
  quizType: string;
  onComplete: () => void;
}

export default function Quiz({ quizType, onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    setUserId(MobileFHEEncryptor.generateUserId());
    setQuestions(quizData[quizType as keyof typeof quizData] || quizData.programming);
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  }, [quizType]);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 500);
    }
  };

  const submitQuiz = async () => {
    if (answers.length < questions.length) {
      alert('Please answer all questions before submitting!');
      return;
    }

    setIsSubmitting(true);
    console.log(`🚀 Submitting ${quizType} quiz...`);

    try {
      const encryptedAnswers = MobileFHEEncryptor.encryptAnswers(answers);
      
      const response = await fetch('http://localhost:8080/evaluate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          encryptedAnswers, 
          user_id: userId,
          quiz_type: quizType
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

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
    setUserId(MobileFHEEncryptor.generateUserId());
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (questions.length === 0) {
    return <div>Loading quiz...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: 'white', marginBottom: '10px', fontSize: '2rem' }}>
          {quizType === 'programming' ? '💻 Programming Assessment' : 
           quizType === 'math' ? '🧮 Math Assessment' : '🎯 Skill Assessment'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Prove your skills without revealing your answers</p>
        <div style={{ 
          background: 'rgba(255,255,255,0.2)', 
          borderRadius: '10px', 
          padding: '10px', 
          marginTop: '10px',
          fontSize: '12px',
          fontFamily: 'monospace',
          color: 'white'
        }}>
          User: {userId} | Quiz: {quizType}
        </div>
      </div>

      {!result ? (
        <>
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

          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>
              Question {currentQuestion + 1} of {questions.length}
            </h3>
            <p style={{ 
              fontSize: '18px', 
              marginBottom: '25px',
              lineHeight: '1.5',
              color: '#555'
            }}>
              {questions[currentQuestion].question}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questions[currentQuestion].options.map((option: string, index: number) => (
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

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {currentQuestion > 0 && (
              <button 
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
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
                {isSubmitting ? '🔄 Encrypting & Submitting...' : '🔐 Submit Encrypted Answers'}
              </button>
            )}
          </div>
        </>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>
            {result.passed ? '🎉' : '📝'}
          </div>
          
          <h2 style={{ 
            color: result.passed ? '#4CAF50' : '#2196F3',
            marginBottom: '15px'
          }}>
            {result.passed ? 'Assessment PASSED!' : 'Assessment Completed'}
          </h2>
          
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

          {result.passed && (
            <div style={{
              background: '#e8f5e8',
              border: '2px solid #4CAF50',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0, color: '#2e7d32' }}>
                ✅ You've proven your {result.quiz_type} skills! Your encrypted result is ready for on-chain verification.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
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
