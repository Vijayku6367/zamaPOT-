use serde::{Deserialize, Serialize};
use rand::{Rng, SeedableRng, rngs::StdRng};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DynamicQuestion {
    pub question_id: String,
    pub question_text: String,
    pub options: Vec<String>,
    pub correct_answer: u8,
    pub parameters: HashMap<String, String>,
    pub difficulty: f32,
    pub expected_time: u32, // in seconds
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserSession {
    pub user_id: String,
    pub questions: Vec<DynamicQuestion>,
    pub start_time: u64,
    pub behavior_metrics: BehaviorMetrics,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BehaviorMetrics {
    pub answer_times: Vec<u32>, // time per question in seconds
    pub switch_count: u32,      // how many times user changed answers
    pub consistency_score: f32, // pattern consistency
}

impl DynamicQuestion {
    pub fn generate_math_question(user_id: &str, difficulty: f32) -> Self {
        let mut rng = rand::thread_rng();
        
        // Use user_id as seed for consistent randomization per user
        let seed = user_id.chars().map(|c| c as u32).sum::<u32>();
        let _user_rng = StdRng::seed_from_u64(seed as u64);
        
        let operation = rng.gen_range(0..4);
        let (question_text, correct_value, params, wrong_answers) = match operation {
            0 => {
                // Addition
                let a = rng.gen_range(1..100);
                let b = rng.gen_range(1..100);
                let answer = a + b;
                
                let mut params = HashMap::new();
                params.insert("a".to_string(), a.to_string());
                params.insert("b".to_string(), b.to_string());
                params.insert("type".to_string(), "addition".to_string());
                
                let wrong_answers = vec![
                    (answer + rng.gen_range(5..15)).to_string(),
                    (answer - rng.gen_range(5..15)).to_string(),
                    (answer + 1).to_string()
                ];
                
                (
                    format!("What is {} + {}?", a, b),
                    answer,
                    params,
                    wrong_answers
                )
            },
            1 => {
                // Subtraction
                let a = rng.gen_range(50..200);
                let b = rng.gen_range(1..a);
                let answer = a - b;
                
                let mut params = HashMap::new();
                params.insert("a".to_string(), a.to_string());
                params.insert("b".to_string(), b.to_string());
                params.insert("type".to_string(), "subtraction".to_string());
                
                let wrong_answers = vec![
                    (answer + rng.gen_range(5..15)).to_string(),
                    (answer - rng.gen_range(5..15)).to_string(),
                    (a + b).to_string() // Use the original a and b values
                ];
                
                (
                    format!("What is {} - {}?", a, b),
                    answer,
                    params,
                    wrong_answers
                )
            },
            2 => {
                // Multiplication
                let a = rng.gen_range(2..20);
                let b = rng.gen_range(2..12);
                let answer = a * b;
                
                let mut params = HashMap::new();
                params.insert("a".to_string(), a.to_string());
                params.insert("b".to_string(), b.to_string());
                params.insert("type".to_string(), "multiplication".to_string());
                
                let wrong_answers = vec![
                    (answer + rng.gen_range(5..15)).to_string(),
                    (answer - rng.gen_range(5..15)).to_string(),
                    ((a + 1) * b).to_string()
                ];
                
                (
                    format!("What is {} × {}?", a, b),
                    answer,
                    params,
                    wrong_answers
                )
            },
            _ => {
                // Division
                let b = rng.gen_range(2..12);
                let answer = rng.gen_range(2..20);
                let a = answer * b;
                
                let mut params = HashMap::new();
                params.insert("a".to_string(), a.to_string());
                params.insert("b".to_string(), b.to_string());
                params.insert("type".to_string(), "division".to_string());
                
                let wrong_answers = vec![
                    (answer + 1).to_string(),
                    (answer - 1).to_string(),
                    ((a / (b + 1)).max(1)).to_string()
                ];
                
                (
                    format!("What is {} ÷ {}?", a, b),
                    answer,
                    params,
                    wrong_answers
                )
            }
        };

        // Generate unique options based on the correct value
        let mut options = vec![correct_value.to_string()];
        options.extend(wrong_answers);
        
        // Shuffle options
        for i in 0..options.len() {
            let j = rng.gen_range(i..options.len());
            options.swap(i, j);
        }

        // Find new correct index after shuffling
        let correct_index = options.iter().position(|x| x == &correct_value.to_string()).unwrap_or(0) as u8;

        DynamicQuestion {
            question_id: format!("math_{}_{}", user_id, rng.gen::<u32>()),
            question_text,
            options,
            correct_answer: correct_index,
            parameters: params,
            difficulty,
            expected_time: 30, // 30 seconds expected
        }
    }

    pub fn generate_programming_question(user_id: &str, difficulty: f32) -> Self {
        let mut rng = rand::thread_rng();
        let seed = user_id.chars().map(|c| c as u32).sum::<u32>();
        let _user_rng = StdRng::seed_from_u64(seed as u64);
        
        let question_type = rng.gen_range(0..3);
        let (question_text, correct_value, params) = match question_type {
            0 => {
                // Fibonacci question with random parameter
                let n = rng.gen_range(5..15);
                let answer = Self::fibonacci(n);
                
                let mut params = HashMap::new();
                params.insert("n".to_string(), n.to_string());
                params.insert("type".to_string(), "fibonacci".to_string());
                
                (
                    format!("What is the {}th number in the Fibonacci sequence? (Start: 0, 1)", n),
                    answer,
                    params
                )
            },
            1 => {
                // Factorial question
                let n = rng.gen_range(4..8);
                let answer = Self::factorial(n);
                
                let mut params = HashMap::new();
                params.insert("n".to_string(), n.to_string());
                params.insert("type".to_string(), "factorial".to_string());
                
                (
                    format!("What is {}! (factorial)?", n),
                    answer,
                    params
                )
            },
            _ => {
                // Prime number question
                let primes = vec![2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
                let n = rng.gen_range(0..primes.len());
                let answer = primes[n];
                
                let mut params = HashMap::new();
                params.insert("prime_index".to_string(), n.to_string());
                params.insert("type".to_string(), "prime".to_string());
                
                (
                    format!("What is the {}th prime number?", n + 1),
                    answer,
                    params
                )
            }
        };

        // Generate wrong answers
        let mut options = vec![correct_value.to_string()];
        let wrong_answers = vec![
            (correct_value + 1).to_string(),
            (correct_value - 1).to_string(),
            (correct_value * 2).to_string()
        ];
        options.extend(wrong_answers);
        
        // Shuffle options
        for i in 0..options.len() {
            let j = rng.gen_range(i..options.len());
            options.swap(i, j);
        }

        let correct_index = options.iter().position(|x| x == &correct_value.to_string()).unwrap_or(0) as u8;

        DynamicQuestion {
            question_id: format!("prog_{}_{}", user_id, rng.gen::<u32>()),
            question_text,
            options,
            correct_answer: correct_index,
            parameters: params,
            difficulty,
            expected_time: 45,
        }
    }

    fn fibonacci(n: u32) -> u32 {
        if n == 0 { return 0; }
        if n == 1 { return 1; }
        
        let mut a = 0;
        let mut b = 1;
        for _ in 2..=n {
            let temp = a + b;
            a = b;
            b = temp;
        }
        b
    }

    fn factorial(n: u32) -> u32 {
        if n == 0 { return 1; }
        (1..=n).product()
    }
}

impl UserSession {
    pub fn new(user_id: String, quiz_type: &str, question_count: usize) -> Self {
        let mut questions = Vec::new();
        let mut rng = rand::thread_rng();
        
        for i in 0..question_count {
            let difficulty = 0.3 + (i as f32 * 0.2); // Increasing difficulty
            let question = match quiz_type {
                "math" => DynamicQuestion::generate_math_question(&user_id, difficulty),
                "programming" => DynamicQuestion::generate_programming_question(&user_id, difficulty),
                "blockchain" => DynamicQuestion::generate_blockchain_question(&user_id, difficulty),
                "security" => DynamicQuestion::generate_security_question(&user_id, difficulty),
                _ => DynamicQuestion::generate_math_question(&user_id, difficulty)
            };
            questions.push(question);
        }

        UserSession {
            user_id,
            questions,
            start_time: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            behavior_metrics: BehaviorMetrics {
                answer_times: Vec::new(),
                switch_count: 0,
                consistency_score: 1.0,
            },
        }
    }

    pub fn add_answer_time(&mut self, time_seconds: u32) {
        self.behavior_metrics.answer_times.push(time_seconds);
    }

    pub fn increment_switch_count(&mut self) {
        self.behavior_metrics.switch_count += 1;
    }

    pub fn calculate_cheating_likelihood(&self) -> f32 {
        let metrics = &self.behavior_metrics;
        
        if metrics.answer_times.is_empty() {
            return 0.0;
        }

        let mut cheating_score: f32 = 0.0;

        // 1. Check for extremely fast answers (likely cheating)
        let avg_time: f32 = metrics.answer_times.iter().sum::<u32>() as f32 / metrics.answer_times.len() as f32;
        let fast_answers = metrics.answer_times.iter().filter(|&&t| t < 3).count() as f32;
        if fast_answers > metrics.answer_times.len() as f32 * 0.5 {
            cheating_score += 0.4;
        }

        // 2. Check for inconsistent timing patterns
        let time_variance: f32 = metrics.answer_times.iter()
            .map(|&t| (t as f32 - avg_time).powi(2))
            .sum::<f32>() / metrics.answer_times.len() as f32;
        
        if time_variance < 1.0 { // Too consistent (bot-like)
            cheating_score += 0.3;
        }

        // 3. Check for excessive answer switching
        let switch_ratio = metrics.switch_count as f32 / self.questions.len() as f32;
        if switch_ratio > 0.8 { // Too much switching
            cheating_score += 0.2;
        }

        // 4. Check for perfect scores with very fast times
        let perfect_fast = avg_time < 5.0 && metrics.answer_times.len() == self.questions.len();
        if perfect_fast {
            cheating_score += 0.3;
        }

        cheating_score.min(1.0)
    }
}

impl DynamicQuestion {
    pub fn generate_blockchain_question(user_id: &str, difficulty: f32) -> Self {
        let mut rng = rand::thread_rng();
        let questions = vec![
            "What is the main purpose of a smart contract?",
            "Which consensus mechanism does Ethereum currently use?",
            "What does 'gas' represent in Ethereum?",
            "What is a blockchain fork?",
            "What is the role of miners/validators?"
        ];
        
        let question_text = questions[rng.gen_range(0..questions.len())].to_string();
        
        // Simple implementation for blockchain questions
        let _correct_value = 0; // First option is correct
        let mut options = vec!["Self-executing contract with code".to_string()];
        let wrong_answers = vec![
            "Legal document on blockchain".to_string(),
            "Cryptocurrency wallet".to_string(),
            "Network node".to_string()
        ];
        options.extend(wrong_answers);
        
        // Shuffle options
        for i in 0..options.len() {
            let j = rng.gen_range(i..options.len());
            options.swap(i, j);
        }
        
        let correct_index = options.iter().position(|x| x == "Self-executing contract with code").unwrap_or(0) as u8;

        DynamicQuestion {
            question_id: format!("bc_{}_{}", user_id, rng.gen::<u32>()),
            question_text,
            options,
            correct_answer: correct_index,
            parameters: HashMap::new(),
            difficulty,
            expected_time: 40,
        }
    }

    pub fn generate_security_question(user_id: &str, difficulty: f32) -> Self {
        let mut rng = rand::thread_rng();
        let questions = vec![
            "What is the primary goal of encryption?",
            "What does 2FA help protect against?",
            "What is a common phishing attack method?",
            "Why should passwords be hashed?",
            "What is social engineering?"
        ];
        
        let question_text = questions[rng.gen_range(0..questions.len())].to_string();
        
        // Simple implementation for security questions
        let _correct_value = 0; // First option is correct
        let mut options = vec!["Protect data confidentiality".to_string()];
        let wrong_answers = vec![
            "Increase data size".to_string(),
            "Speed up data transfer".to_string(),
            "Make data public".to_string()
        ];
        options.extend(wrong_answers);
        
        // Shuffle options
        for i in 0..options.len() {
            let j = rng.gen_range(i..options.len());
            options.swap(i, j);
        }
        
        let correct_index = options.iter().position(|x| x == "Protect data confidentiality").unwrap_or(0) as u8;

        DynamicQuestion {
            question_id: format!("sec_{}_{}", user_id, rng.gen::<u32>()),
            question_text,
            options,
            correct_answer: correct_index,
            parameters: HashMap::new(),
            difficulty,
            expected_time: 35,
        }
    }
}
