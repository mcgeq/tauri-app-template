use crate::error::AppError;
use tracing::{info, instrument};

#[tauri::command]
#[instrument]
pub fn greet(name: &str) -> Result<String, AppError> {
    info!(name = %name, "Greeting requested");
    Ok(format!("Hello, {}! You've been greeted from Rust!", name))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet() {
        let response = greet("World").expect("greet command should succeed");
        assert_eq!(response, "Hello, World! You've been greeted from Rust!");
    }

    #[test]
    fn test_greet_empty() {
        let response = greet("").expect("greet command should succeed");
        assert_eq!(response, "Hello, ! You've been greeted from Rust!");
    }
}
