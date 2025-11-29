use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct QuizConfig {
    pub quiz_type: String,
    pub questions: Vec<Question>,
    pub passing_score: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Question {
    pub id: u32,
    pub question: String,
    pub options: Vec<String>,
    pub correct_answer: u8,
}

impl QuizConfig {
    pub fn programming_quiz() -> Self {
        QuizConfig {
            quiz_type: "programming".to_string(),
            passing_score: 0.6,
            questions: vec![
                Question {
                    id: 1,
                    question: "What does FHE stand for?".to_string(),
                    options: vec![
                        "Fully Homomorphic Encryption".to_string(),
                        "Federated Hardware Encryption".to_string(),
                        "Fast Hash Encryption".to_string(),
                    ],
                    correct_answer: 0,
                },
                Question {
                    id: 2,
                    question: "Which language is best for FHE?".to_string(),
                    options: vec![
                        "Rust".to_string(),
                        "Python".to_string(),
                        "JavaScript".to_string(),
                    ],
                    correct_answer: 0,
                },
                Question {
                    id: 3,
                    question: "What is Zero-Knowledge Proof?".to_string(),
                    options: vec![
                        "Proving something without revealing details".to_string(),
                        "A type of encryption".to_string(),
                        "A blockchain consensus".to_string(),
                    ],
                    correct_answer: 0,
                },
            ],
        }
    }

    pub fn math_quiz() -> Self {
        QuizConfig {
            quiz_type: "math".to_string(),
            passing_score: 0.7,
            questions: vec![
                Question {
                    id: 1,
                    question: "What is 15 + 27?".to_string(),
                    options: vec!["42".to_string(), "32".to_string(), "52".to_string()],
                    correct_answer: 0,
                },
                Question {
                    id: 2,
                    question: "Solve: 8 × 7".to_string(),
                    options: vec!["56".to_string(), "54".to_string(), "64".to_string()],
                    correct_answer: 0,
                },
                Question {
                    id: 3,
                    question: "What is 144 ÷ 12?".to_string(),
                    options: vec!["12".to_string(), "11".to_string(), "13".to_string()],
                    correct_answer: 0,
                },
            ],
        }
    }

    pub fn blockchain_quiz() -> Self {
        QuizConfig {
            quiz_type: "blockchain".to_string(),
            passing_score: 0.6,
            questions: vec![
                Question {
                    id: 1,
                    question: "What is a smart contract?".to_string(),
                    options: vec![
                        "Self-executing contract with code".to_string(),
                        "Legal document on blockchain".to_string(),
                        "Cryptocurrency wallet".to_string(),
                    ],
                    correct_answer: 0,
                },
                Question {
                    id: 2,
                    question: "Which consensus mechanism does Ethereum use?".to_string(),
                    options: vec![
                        "Proof of Stake".to_string(),
                        "Proof of Work".to_string(),
                        "Delegated Proof of Stake".to_string(),
                    ],
                    correct_answer: 0,
                },
                Question {
                    id: 3,
                    question: "What is gas fee in Ethereum?".to_string(),
                    options: vec![
                        "Transaction execution cost".to_string(),
                        "Mining reward".to_string(),
                        "Network subscription".to_string(),
                    ],
                    correct_answer: 0,
                },
            ],
        }
    }

    pub fn security_quiz() -> Self {
        QuizConfig {
            quiz_type: "security".to_string(),
            passing_score: 0.8,
            questions: vec![
                Question {
                    id: 1,
                    question: "What is phishing?".to_string(),
                    options: vec![
                        "Fraudulent attempt to obtain sensitive information".to_string(),
                        "Type of encryption".to_string(),
                        "Blockchain attack".to_string(),
                    ],
                    correct_answer: 0,
                },
                Question {
                    id: 2,
                    question: "What is 2FA?".to_string(),
                    options: vec![
                        "Two-Factor Authentication".to_string(),
                        "Two-File Archive".to_string(),
                        "Two-Function Algorithm".to_string(),
                    ],
                    correct_answer: 0,
                },
                Question {
                    id: 3,
                    question: "What's a common password best practice?".to_string(),
                    options: vec![
                        "Use long, complex passwords".to_string(),
                        "Use same password everywhere".to_string(),
                        "Use personal information".to_string(),
                    ],
                    correct_answer: 0,
                },
            ],
        }
    }
}
