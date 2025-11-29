use actix_web::{web, App, HttpServer, HttpResponse, Result};
use serde::{Deserialize, Serialize};
use rand::Rng;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
struct QuizRequest {
    encrypted_answers: Vec<String>,
    user_id: Option<String>,
}

#[derive(Debug, Serialize)]
struct QuizResponse {
    passed: bool,
    encrypted_score: String,
    level: u8,
    correct_answers: usize,
    total_questions: usize,
}

// Simple encryption simulation for mobile
struct MobileFHE {
    correct_answers: Vec<u8>,
}

impl MobileFHE {
    fn new() -> Self {
        MobileFHE {
            correct_answers: vec![0, 0, 0], // Correct answers for the quiz
        }
    }

    // Simulate FHE evaluation without actual FHE dependencies
    fn evaluate_quiz(&self, encrypted_answers: &[String]) -> QuizResponse {
        println!("🔐 Evaluating encrypted quiz on mobile backend...");
        
        let mut correct_count = 0;
        let total_questions = self.correct_answers.len();

        // Simulate encrypted answer checking
        for (i, enc_answer) in encrypted_answers.iter().enumerate() {
            if i < total_questions {
                // In real FHE, this would be homomorphic comparison
                // For mobile compatibility, we simulate the logic
                if self.simulate_encrypted_check(enc_answer, i) {
                    correct_count += 1;
                }
            }
        }

        let passed = correct_count >= 2; // Need at least 2/3 correct
        let level = match correct_count {
            3 => 3, // Expert
            2 => 2, // Intermediate  
            1 => 1, // Beginner
            _ => 1,
        };

        // Generate simulated encrypted score
        let encrypted_score = self.generate_encrypted_score(correct_count);

        println!("📊 Results: {}/{} correct, Level: {}", correct_count, total_questions, level);

        QuizResponse {
            passed,
            encrypted_score,
            level,
            correct_answers: correct_count,
            total_questions,
        }
    }

    fn simulate_encrypted_check(&self, encrypted_answer: &str, question_index: usize) -> bool {
        // Simulate FHE comparison logic
        // In real implementation, this would use TFHE operations
        !encrypted_answer.is_empty() && encrypted_answer.len() > 10
    }

    fn generate_encrypted_score(&self, correct_count: usize) -> String {
        let mut rng = rand::thread_rng();
        let random_salt: u32 = rng.gen();
        format!("encrypted_score_{}_{:x}", correct_count, random_salt)
    }
}

async fn evaluate_quiz(
    req: web::Json<QuizRequest>,
    data: web::Data<AppState>,
) -> Result<HttpResponse> {
    println!("📨 Received quiz evaluation request");
    println!("   User: {:?}", req.user_id);
    println!("   Answers: {} encrypted answers", req.encrypted_answers.len());

    let response = data.fhe_engine.evaluate_quiz(&req.encrypted_answers);

    println!("✅ Evaluation complete: {}", if response.passed { "PASSED" } else { "FAILED" });

    Ok(HttpResponse::Ok().json(response))
}

#[derive(Debug, Deserialize)]
struct HealthResponse {
    status: String,
    architecture: String,
    fhe_capable: bool,
}

async fn health_check() -> Result<HttpResponse> {
    let response = HealthResponse {
        status: "OK".to_string(),
        architecture: std::env::consts::ARCH.to_string(),
        fhe_capable: false, // Simplified for mobile
    };
    Ok(HttpResponse::Ok().json(response))
}

// Application state
struct AppState {
    fhe_engine: MobileFHE,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("🚀 Starting Mobile FHE Backend Server...");
    println!("   Architecture: {}", std::env::consts::ARCH);
    println!("   OS: {}", std::env::consts::OS);
    println!("   Server will run on: http://0.0.0.0:8080");

    let app_data = web::Data::new(AppState {
        fhe_engine: MobileFHE::new(),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(app_data.clone())
            .route("/evaluate-quiz", web::post().to(evaluate_quiz))
            .route("/health", web::get().to(health_check))
            .route("/", web::get().to(|| async { 
                HttpResponse::Ok().body("
                    🛡️ Private Proof of Talent - FHE Backend\n\n
                    Endpoints:\n
                    POST /evaluate-quiz - Evaluate encrypted quiz\n  
                    GET  /health        - Health check\n
                    GET  /              - This message
                ") 
            }))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
