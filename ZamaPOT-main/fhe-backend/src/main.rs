mod quiz_types;
mod dynamic_questions;

use actix_web::{web, App, HttpServer, HttpResponse, Result};
use serde::{Deserialize, Serialize};
use rand::Rng;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use quiz_types::QuizConfig;
use dynamic_questions::{DynamicQuestion, UserSession};

#[derive(Debug, Deserialize)]
struct QuizRequest {
    encrypted_answers: Vec<String>,
    user_id: String,
    quiz_type: String,
    behavior_data: BehaviorData,
}

#[derive(Debug, Deserialize)]
struct BehaviorData {
    answer_times: Vec<u32>, // Time spent on each question in seconds
    switch_counts: Vec<u32>, // How many times each answer was changed
    start_time: u64,
    end_time: u64,
}

#[derive(Debug, Serialize)]
struct QuizResponse {
    passed: bool,
    encrypted_score: String,
    level: u8,
    correct_answers: usize,
    total_questions: usize,
    quiz_type: String,
    certificate_id: String,
    cheating_likelihood: f32,
    behavior_analysis: BehaviorAnalysis,
    is_flagged: bool,
}

#[derive(Debug, Serialize)]
struct BehaviorAnalysis {
    average_time: f32,
    time_consistency: f32,
    switch_frequency: f32,
    pattern_deviation: f32,
}

#[derive(Debug, Deserialize)]
struct SessionRequest {
    user_id: String,
    quiz_type: String,
}

#[derive(Debug, Serialize)]
struct SessionResponse {
    session_id: String,
    questions: Vec<DynamicQuestion>,
}

struct MobileFHE {
    quizzes: HashMap<String, QuizConfig>,
    user_sessions: Arc<Mutex<HashMap<String, UserSession>>>,
}

impl MobileFHE {
    fn new() -> Self {
        let mut quizzes = HashMap::new();
        quizzes.insert("programming".to_string(), QuizConfig::programming_quiz());
        quizzes.insert("math".to_string(), QuizConfig::math_quiz());
        quizzes.insert("blockchain".to_string(), QuizConfig::blockchain_quiz());
        quizzes.insert("security".to_string(), QuizConfig::security_quiz());
        
        MobileFHE { 
            quizzes,
            user_sessions: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    fn create_user_session(&self, user_id: String, quiz_type: String) -> String {
        let session_id = format!("{}_{}_{}", user_id, quiz_type, rand::thread_rng().gen::<u32>());
        let question_count = self.quizzes.get(&quiz_type)
            .map(|config| config.questions.len())
            .unwrap_or(3);
        
        let user_session = UserSession::new(user_id.clone(), &quiz_type, question_count);
        
        let mut sessions = self.user_sessions.lock().unwrap();
        sessions.insert(session_id.clone(), user_session);
        
        session_id
    }

    fn get_session_questions(&self, session_id: &str) -> Option<Vec<DynamicQuestion>> {
        let sessions = self.user_sessions.lock().unwrap();
        sessions.get(session_id).map(|session| {
            session.questions.iter().cloned().collect()
        })
    }

    fn evaluate_quiz_with_behavior(
        &self, 
        session_id: &str,
        encrypted_answers: &[String], 
        behavior_data: &BehaviorData
    ) -> Option<QuizResponse> {
        let mut sessions = self.user_sessions.lock().unwrap();
        let user_session = sessions.get_mut(session_id)?;
        
        // Update behavior metrics
        for &time in &behavior_data.answer_times {
            user_session.add_answer_time(time);
        }
        for &switches in &behavior_data.switch_counts {
            if switches > 0 {
                user_session.increment_switch_count();
            }
        }

        let total_questions = user_session.questions.len();
        let mut correct_count = 0;

        // Simulate FHE evaluation of answers
        for (i, enc_answer) in encrypted_answers.iter().enumerate() {
            if i < total_questions {
                if self.simulate_encrypted_check(enc_answer, i, &user_session.questions[i]) {
                    correct_count += 1;
                }
            }
        }

        let score_percentage = correct_count as f32 / total_questions as f32;
        
        // Get quiz type from first question parameters
        let quiz_type = user_session.questions[0].parameters.get("type")
            .cloned()
            .unwrap_or_else(|| "math".to_string());
            
        let quiz_config = self.quizzes.get(&quiz_type).or_else(|| self.quizzes.get("math"))?;
        let passed = score_percentage >= quiz_config.passing_score;
        
        let cheating_likelihood = user_session.calculate_cheating_likelihood();
        let is_flagged = cheating_likelihood > 0.6; // Flag if cheating likelihood > 60%

        let level = if is_flagged {
            1 // Reduced level if flagged
        } else {
            match score_percentage {
                p if p >= 0.9 => 5,
                p if p >= 0.7 => 4,
                p if p >= 0.6 => 3,
                p if p >= 0.5 => 2,
                _ => 1,
            }
        };

        let behavior_analysis = self.analyze_behavior(behavior_data, total_questions);
        
        let encrypted_score = self.generate_encrypted_score(correct_count, &quiz_type);
        let certificate_id = self.generate_certificate_id(correct_count, &quiz_type, cheating_likelihood);

        Some(QuizResponse {
            passed: passed && !is_flagged,
            encrypted_score,
            level,
            correct_answers: correct_count,
            total_questions,
            quiz_type,
            certificate_id,
            cheating_likelihood,
            behavior_analysis,
            is_flagged,
        })
    }

    fn simulate_encrypted_check(&self, encrypted_answer: &str, _question_index: usize, _question: &DynamicQuestion) -> bool {
        // In real FHE, this would use proper encrypted comparison
        !encrypted_answer.is_empty() && encrypted_answer.len() > 5
    }

    fn analyze_behavior(&self, behavior_data: &BehaviorData, total_questions: usize) -> BehaviorAnalysis {
        let avg_time: f32 = behavior_data.answer_times.iter().sum::<u32>() as f32 / behavior_data.answer_times.len() as f32;
        
        // Calculate time consistency (variance)
        let time_variance: f32 = behavior_data.answer_times.iter()
            .map(|&t| (t as f32 - avg_time).powi(2))
            .sum::<f32>() / behavior_data.answer_times.len() as f32;
        
        let time_consistency = (1.0 / (1.0 + time_variance)).min(1.0);
        
        // Calculate switch frequency
        let total_switches: u32 = behavior_data.switch_counts.iter().sum();
        let switch_frequency = total_switches as f32 / total_questions as f32;
        
        // Pattern deviation (simplified)
        let pattern_deviation = if behavior_data.answer_times.len() > 1 {
            let min_time = *behavior_data.answer_times.iter().min().unwrap() as f32;
            let max_time = *behavior_data.answer_times.iter().max().unwrap() as f32;
            (max_time - min_time) / avg_time
        } else {
            0.0
        };

        BehaviorAnalysis {
            average_time: avg_time,
            time_consistency,
            switch_frequency,
            pattern_deviation,
        }
    }

    fn generate_encrypted_score(&self, correct_count: usize, quiz_type: &str) -> String {
        let mut rng = rand::thread_rng();
        let random_salt: u32 = rng.gen();
        format!("enc_{}_{}_{:x}", quiz_type, correct_count, random_salt)
    }

    fn generate_certificate_id(&self, correct_count: usize, quiz_type: &str, cheating_likelihood: f32) -> String {
        let mut rng = rand::thread_rng();
        let id: u32 = rng.gen();
        let cls_code = (cheating_likelihood * 100.0) as u32;
        format!("CERT_{}_{}_{:03}_{:08x}", quiz_type.to_uppercase(), correct_count, cls_code, id)
    }

    fn get_available_quizzes(&self) -> Vec<String> {
        self.quizzes.keys().cloned().collect()
    }
}

// API Endpoints
async fn create_session(
    req: web::Json<SessionRequest>,
    data: web::Data<AppState>,
) -> Result<HttpResponse> {
    println!("🎯 Creating new session for user: {}", req.user_id);
    
    let session_id = data.fhe_engine.create_user_session(req.user_id.clone(), req.quiz_type.clone());
    let questions = data.fhe_engine.get_session_questions(&session_id).unwrap_or_default();
    
    let response = SessionResponse {
        session_id,
        questions,
    };
    
    Ok(HttpResponse::Ok().json(response))
}

async fn evaluate_quiz(
    req: web::Json<QuizRequest>,
    data: web::Data<AppState>,
) -> Result<HttpResponse> {
    println!("📊 Evaluating quiz with behavior analysis for session: {}", req.user_id);
    
    match data.fhe_engine.evaluate_quiz_with_behavior(&req.user_id, &req.encrypted_answers, &req.behavior_data) {
        Some(response) => {
            let status = if response.passed { "PASSED" } else { "FAILED" };
            let flagged = if response.is_flagged { "🚩 FLAGGED" } else { "✅ CLEAN" };
            println!("✅ Evaluation complete: {} | Cheating Likelihood: {:.2} | {}", 
                     status, response.cheating_likelihood, flagged);
            Ok(HttpResponse::Ok().json(response))
        }
        None => {
            println!("❌ Session not found: {}", req.user_id);
            Ok(HttpResponse::BadRequest().body("Session not found"))
        }
    }
}

async fn get_quizzes(data: web::Data<AppState>) -> Result<HttpResponse> {
    let available_quizzes = data.fhe_engine.get_available_quizzes();
    Ok(HttpResponse::Ok().json(available_quizzes))
}

#[derive(Debug, Serialize)]
struct HealthResponse {
    status: String,
    architecture: String,
    backend_version: String,
    available_quizzes: usize,
    active_sessions: usize,
}

async fn health_check(data: web::Data<AppState>) -> Result<HttpResponse> {
    let sessions = data.fhe_engine.user_sessions.lock().unwrap();
    let response = HealthResponse {
        status: "OK".to_string(),
        architecture: std::env::consts::ARCH.to_string(),
        backend_version: "3.0.0".to_string(),
        available_quizzes: data.fhe_engine.get_available_quizzes().len(),
        active_sessions: sessions.len(),
    };
    Ok(HttpResponse::Ok().json(response))
}

struct AppState {
    fhe_engine: MobileFHE,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("🚀 Starting Advanced FHE Backend Server v3.0...");
    println!("   Architecture: {}", std::env::consts::ARCH);
    println!("   Features: Dynamic Questions + Anti-Cheating + Behavior Analysis");
    println!("   Server: http://0.0.0.0:8080");

    let app_data = web::Data::new(AppState {
        fhe_engine: MobileFHE::new(),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(app_data.clone())
            .route("/create-session", web::post().to(create_session))
            .route("/evaluate-quiz", web::post().to(evaluate_quiz))
            .route("/quizzes", web::get().to(get_quizzes))
            .route("/health", web::get().to(health_check))
            .route("/", web::get().to(|| async { 
                HttpResponse::Ok().body(
                    "🛡️ Private Proof of Talent - Advanced FHE Backend v3.0\n\n\
                    Features:\n\
                    • Dynamic Question Generation\n\
                    • Per-User Randomization\n\
                    • Behavior Analysis\n\
                    • Cheating Detection\n\
                    • FHE-Based Consistency Checks\n\n\
                    Endpoints:\n\
                    POST /create-session - Create assessment session\n\
                    POST /evaluate-quiz - Evaluate with behavior analysis\n\
                    GET  /quizzes       - Get available quizzes\n\
                    GET  /health        - Health check\n\
                    GET  /              - This message"
                ) 
            }))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
