"use client";
import { useState, useEffect } from "react";
import { MobileFHEEncryptor } from "../../utils/encryption";
import { blockchainService } from "../../services/blockchain";
import WalletConnect from "../../components/WalletConnect";

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

export default function EnhancedQuiz({
  quizType,
  onComplete,
}: {
  quizType: string;
  onComplete: () => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [questions, setQuestions] = useState<DynamicQuestion[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string>("");

  // Behavior Tracking
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
      const response = await fetch("http://localhost:8080/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          quiz_type: quizType,
        }),
      });

      const data = await response.json();
      setSessionId(data.session_id);
      setQuestions(data.questions);
      setCurrentQuestion(0);
      setAnswers([]);
      setResult(null);
      setMintedTokenId(null);

      const starts = Array(data.questions.length).fill(0);
      starts[0] = Date.now();
      setQuestionStartTimes(starts);
      setSwitchCounts(Array(data.questions.length).fill(0));
    } catch (error) {
      console.error("Error initializing session:", error);
    }
  };

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];

    // track switching
    if (
      newAnswers[currentQuestion] !== undefined &&
      newAnswers[currentQuestion] !== answerIndex
    ) {
      const newSwitch = [...switchCounts];
      newSwitch[currentQuestion]++;
      setSwitchCounts(newSwitch);
    }

    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        const newStart = [...questionStartTimes];
        newStart[currentQuestion + 1] = Date.now();
        setQuestionStartTimes(newStart);

        setCurrentQuestion(currentQuestion + 1);
      }, 400);
    }
  };

  const submitQuiz = async () => {
    if (answers.length < questions.length) {
      alert("Please answer all questions!");
      return;
    }

    setIsSubmitting(true);

    try {
      // calculate timings
      const answerTimes = questionStartTimes.map((time, i) =>
        i === questionStartTimes.length - 1
          ? Math.floor((Date.now() - time) / 1000)
          : Math.floor((questionStartTimes[i + 1] - time) / 1000)
      );

      const behaviorData: BehaviorData = {
        answer_times: answerTimes,
        switch_counts: switchCounts,
        start_time: Math.floor(sessionStartTime / 1000),
        end_time: Math.floor(Date.now() / 1000),
      };

      const encryptedAnswers = MobileFHEEncryptor.encryptAnswers(answers);

      const response = await fetch("http://localhost:8080/evaluate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encryptedAnswers,
          user_id: sessionId,
          quiz_type: quizType,
          behavior_data: behaviorData,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Error submitting quiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mintNFT = async () => {
    if (!walletAddress) return alert("Connect wallet first!");

    setIsMinting(true);

    try {
     const tokenId = await blockchainService.mintTalentBadge(
        result.quiz_type,
        result.encrypted_score,
        result.level,
        "default-cert",                   // certificateId
        result.cheatingLikelihood || 0,   // cheatingLikelihood (from your code)
        false,                            // behaviorFlagged
        result.totalQuestions || 10,      // totalQuestions
        result.correctAnswers || 5        // correctAnswers
);

      setMintedTokenId(tokenId);
    } catch (error: any) {
      alert("Minting failed: " + error.message);
    } finally {
      setIsMinting(false);
    }
  };

  const viewOnExplorer = () => {
    if (!mintedTokenId) return;
    window.open(
      `https://sepolia.etherscan.io/token/0x7F756eA338dE78078a88e6D174bE18916a5c2dE0?a=${mintedTokenId}`,
      "_blank"
    );
  };

  const restartQuiz = () => {
    initializeSession(userId);
  };

  const progress =
    questions.length > 0
      ? ((currentQuestion + 1) / questions.length) * 100
      : 0;

  if (questions.length === 0) {
    return (
      <div style={{ padding: 50, color: "white", textAlign: "center" }}>
        Loading quiz...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 650, margin: "0 auto", padding: 20 }}>
      <WalletConnect onConnect={handleWalletConnect} />

      <h2 style={{ textAlign: "center", color: "white", marginBottom: 10 }}>
        Assessment — {quizType.toUpperCase()}
      </h2>

      <div
        style={{
          height: 8,
          background: "rgba(255,255,255,0.2)",
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            height: 8,
            width: `${progress}%`,
            background: "#4CAF50",
            borderRadius: 10,
            transition: "0.3s",
          }}
        />
      </div>

      {!result && (
        <div>
          {/* Question Card */}
          <div
            style={{
              background: "white",
              padding: 22,
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <h3>
              Question {currentQuestion + 1} / {questions.length}
            </h3>
            <p style={{ fontSize: 18 }}>{questions[currentQuestion].question_text}</p>

            {questions[currentQuestion].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 10,
                  padding: 14,
                  fontSize: 16,
                  textAlign: "left",
                  borderRadius: 10,
                  background:
                    answers[currentQuestion] === i ? "#e8f5e9" : "white",
                  border:
                    answers[currentQuestion] === i
                      ? "2px solid #4CAF50"
                      : "2px solid #ccc",
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Submit */}
          {currentQuestion === questions.length - 1 && (
            <button
              onClick={submitQuiz}
              disabled={isSubmitting}
              style={{
                padding: "14px 24px",
                width: "100%",
                background: "#4CAF50",
                color: "white",
                borderRadius: 10,
                fontSize: 18,
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Encrypted Answers"}
            </button>
          )}
        </div>
      )}

      {/* ================= RESULTS ================= */}
      {result && (
        <div
          style={{
            background: "white",
            padding: 25,
            borderRadius: 12,
            marginTop: 20,
          }}
        >
          <h2 style={{ marginBottom: 10 }}>
            {result.is_flagged ? "⚠️ Flagged" : "🎉 Completed"}
          </h2>

          <p>
            <strong>Score:</strong> {result.correct_answers}/
            {result.total_questions}
          </p>
          <p>
            <strong>Level:</strong> {result.level}/5
          </p>

          {!mintedTokenId ? (
            <button
              onClick={mintNFT}
              disabled={isMinting}
              style={{
                padding: 14,
                width: "100%",
                background: "#FF6B35",
                borderRadius: 10,
                color: "white",
                marginTop: 10,
              }}
            >
              {isMinting ? "Minting..." : "Mint Talent NFT"}
            </button>
          ) : (
            <button
              onClick={viewOnExplorer}
              style={{
                padding: 14,
                width: "100%",
                background: "#2196F3",
                color: "white",
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              View on Explorer
            </button>
          )}

          {/* Retry / Back */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
              justifyContent: "center",
            }}
          >
            <button
              onClick={restartQuiz}
              style={{
                padding: "12px 20px",
                background: "#2196F3",
                color: "white",
                borderRadius: 10,
              }}
            >
              Retry Quiz
            </button>

            <button
              onClick={onComplete}
              style={{
                padding: "12px 20px",
                border: "2px solid #2196F3",
                color: "#2196F3",
                borderRadius: 10,
                background: "transparent",
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
