"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { mintNFTCertificate, getMintFee } from "../../../utils/contract";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mintFee, setMintFee] = useState("0");

  const questions = {
    programming: [
      {
        id: 1,
        question: "What is Fully Homomorphic Encryption (FHE)?",
        options: [
          "Encryption that allows computation on encrypted data",
          "A type of blockchain consensus mechanism", 
          "A programming language for smart contracts",
          "A database encryption standard"
        ],
        correct: 0
      },
      {
        id: 2, 
        question: "Which library is commonly used for FHE in Rust?",
        options: [
          "TFHE-rs",
          "OpenSSL",
          "Web3.js",
          "React"
        ],
        correct: 0
      },
      {
        id: 3,
        question: "What does ZKP stand for in cryptography?",
        options: [
          "Zero-Knowledge Proof",
          "Zero-Kernel Protocol",
          "Zoned Key Protection", 
          "Zigzag Key Pattern"
        ],
        correct: 0
      }
    ],
    web3: [
      {
        id: 1,
        question: "What is Zero-Knowledge Proof (ZKP) in blockchain?",
        options: [
          "Proving something is true without revealing the information",
          "A type of cryptocurrency wallet",
          "A consensus algorithm for mining",
          "A smart contract programming language"
        ],
        correct: 0
      },
      {
        id: 2,
        question: "Which of these is a key feature of FHE?",
        options: [
          "Computation on encrypted data",
          "Faster transaction speeds",
          "Lower gas fees",
          "Anonymous transactions"
        ],
        correct: 0
      }
    ],
    fhe: [
      {
        id: 1,
        question: "What does FHE stand for?",
        options: [
          "Fully Homomorphic Encryption",
          "Federated Hardware Encryption", 
          "Fast Hash Encryption",
          "Fixed Header Encryption"
        ],
        correct: 0
      }
    ],
    "smart-contracts": [
      {
        id: 1,
        question: "What is a smart contract?",
        options: [
          "Self-executing contract with terms in code",
          "A legally binding digital document",
          "A type of cryptocurrency",
          "A secure messaging protocol"
        ],
        correct: 0
      }
    ]
  };

  const categoryInfo = {
    programming: { title: "Programming", icon: "💻", skill: "Programming" },
    web3: { title: "Web3 & Blockchain", icon: "🔗", skill: "Web3" },
    fhe: { title: "FHE Fundamentals", icon: "🔒", skill: "FHE" },
    "smart-contracts": { title: "Smart Contracts", icon: "📜", skill: "Smart Contracts" }
  };

  const currentQuestions = questions[category as keyof typeof questions] || questions.programming;

  useEffect(() => {
    // Mint fee fetch karein
    const fetchMintFee = async () => {
      const fee = await getMintFee();
      setMintFee(fee);
    };
    fetchMintFee();

    // Timer setup
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    if (selectedOption !== null) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = selectedOption;
      setAnswers(newAnswers);
    }

    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const finalAnswers = selectedOption !== null ? 
        [...answers, selectedOption] : answers;
      
      const score = calculateScore(finalAnswers);
      const skill = categoryInfo[category as keyof typeof categoryInfo]?.skill || "General";
      
      const result = await mintNFTCertificate(skill, score);
      
      alert(`🎉 ${result.message}\nToken: ${result.tokenId}\nTXN: ${result.hash}`);
      router.push("/");
      
    } catch (error: any) {
      console.error("Submission error:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateScore = (answerList: number[]) => {
    const correctAnswers = answerList.filter((ans, idx) => 
      ans === currentQuestions[idx]?.correct
    ).length;
    
    return Math.round((correctAnswers / currentQuestions.length) * 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!categoryInfo[category as keyof typeof categoryInfo]) {
    return (
      <div className="min-h-screen bg-[#02030A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Category not found</h1>
          <button 
            onClick={() => router.push("/quiz")}
            className="px-6 py-3 bg-gradient-to-r from-[#4C63FF] to-[#7DA5FF] text-white rounded-xl"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02030A] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push("/quiz")}
              className="px-4 py-2 border border-[#3A5BFF]/40 text-[#3A5BFF] rounded-lg hover:bg-[#3A5BFF]/10"
            >
              ← Back
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#4C63FF] to-[#7DA5FF] rounded-xl flex items-center justify-center">
                <span className="text-lg">{categoryInfo[category as keyof typeof categoryInfo]?.icon}</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">
                  {categoryInfo[category as keyof typeof categoryInfo]?.title}
                </h1>
                <p className="text-[#8D8F98] text-sm">Private Skill Assessment</p>
              </div>
            </div>
          </div>

          {/* Timer & Fee Info */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-[#8D8F98] text-sm">Mint Fee: {mintFee} ETH</div>
              <div className={`px-3 py-1 rounded-lg border ${
                timeLeft < 300 ? 'border-red-500/40 bg-red-500/10' : 'border-[#3A5BFF]/40 bg-[#3A5BFF]/10'
              }`}>
                <span className={`font-mono text-sm font-bold ${
                  timeLeft < 300 ? 'text-red-400' : 'text-[#3A5BFF]'
                }`}>
                  ⏱️ {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-[#8D8F98] mb-2">
            <span>Question {currentQuestion + 1} of {currentQuestions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / currentQuestions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-[#0C0F1A] rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#4C63FF] to-[#7DA5FF] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / currentQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-[#111421] border border-[#3A5BFF]/20 rounded-3xl p-8 neon-glow mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {currentQuestions[currentQuestion]?.question}
          </h2>

          <div className="space-y-4">
            {currentQuestions[currentQuestion]?.options.map((option, index) => (
              <div
                key={index}
                onClick={() => setSelectedOption(index)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedOption === index
                    ? 'border-[#4C63FF] bg-[#4C63FF]/10'
                    : 'border-[#3A5BFF]/20 hover:border-[#3A5BFF]/40'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedOption === index
                      ? 'border-[#4C63FF] bg-[#4C63FF]'
                      : 'border-[#8D8F98]'
                  }`}>
                    {selectedOption === index && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-white text-lg">{option}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => currentQuestion > 0 && setCurrentQuestion(prev => prev - 1)}
            disabled={currentQuestion === 0}
            className={`px-6 py-3 rounded-xl font-semibold ${
              currentQuestion === 0
                ? 'bg-gray-600/20 text-gray-400 cursor-not-allowed'
                : 'bg-[#3A5BFF]/10 text-[#3A5BFF] hover:bg-[#3A5BFF]/20'
            }`}
          >
            ← Previous
          </button>

          <div className="text-center">
            <div className="text-[#8D8F98] text-sm mb-1">
              {currentQuestion === currentQuestions.length - 1 ? 
                "Submit to mint Talent Badge NFT" : 
                `${currentQuestions.length - currentQuestion - 1} questions left`}
            </div>
            <button
              onClick={handleNext}
              disabled={selectedOption === null || isSubmitting}
              className={`px-8 py-3 rounded-xl font-semibold ${
                selectedOption === null || isSubmitting
                  ? 'bg-gray-600/20 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#4C63FF] to-[#7DA5FF] text-white hover-glow'
              }`}
            >
              {isSubmitting ? '🔄 Minting...' : 
               currentQuestion === currentQuestions.length - 1 ? '🎉 Submit & Mint NFT' : 'Next Question →'}
            </button>
          </div>

          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>

        {/* Status Info */}
        <div className="mt-8 text-center space-y-2">
          <div className="inline-flex items-center space-x-2 bg-[#0C0F1A] border border-[#3A5BFF]/20 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[#C7C9D1] text-sm">
              {isSubmitting ? 'Minting Talent Badge on Sepolia...' : 'Answers are encrypted locally'}
            </span>
          </div>
          {mintFee !== "0" && (
            <div className="text-[#8D8F98] text-sm">
              NFT Minting requires {mintFee} ETH fee + gas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
