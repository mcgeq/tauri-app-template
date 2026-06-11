use crate::error::AppError;
use crate::response::ApiResponse;
use tracing::{info, instrument};

#[tauri::command]
#[instrument]
pub fn greet(name: &str) -> Result<ApiResponse<String>, AppError> {
    info!(name = %name, "Greeting requested");
    Ok(ApiResponse::success(format!(
        "Hello, {}! You've been greeted from Rust!",
        name
    )))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet() {
        let response = greet("World").expect("greet command should succeed");
        assert_eq!(
            response.data.as_deref(),
            Some("Hello, World! You've been greeted from Rust!")
        );
    }

    #[test]
    fn test_greet_empty() {
        let response = greet("").expect("greet command should succeed");
        assert_eq!(
            response.data.as_deref(),
            Some("Hello, ! You've been greeted from Rust!")
        );
    }
}
