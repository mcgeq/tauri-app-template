use std::path::PathBuf;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("{0}")]
    Generic(String),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("IO error at {path}: {source}")]
    Io { path: PathBuf, source: std::io::Error },

    #[error("Notification error: {0}")]
    Notification(String),

    #[error("Task error: {0}")]
    Task(String),

    #[error("Tauri error: {0}")]
    Tauri(String),
}

impl AppError {
    /// Safe message for the frontend — internal paths are sanitized.
    pub fn user_message(&self) -> String {
        match self {
            AppError::Io { path, source: _ } => {
                let file = path.file_name()
                    .map(|n| n.to_string_lossy())
                    .unwrap_or_default();
                format!("IO error: {file}")
            }
            _ => self.to_string(),
        }
    }
}

impl From<String> for AppError {
    fn from(s: String) -> Self {
        AppError::Generic(s)
    }
}

impl From<&str> for AppError {
    fn from(s: &str) -> Self {
        AppError::Generic(s.to_string())
    }
}

impl From<std::io::Error> for AppError {
    fn from(source: std::io::Error) -> Self {
        AppError::Io {
            path: PathBuf::new(),
            source,
        }
    }
}

impl From<tauri::Error> for AppError {
    fn from(e: tauri::Error) -> Self {
        AppError::Tauri(e.to_string())
    }
}

impl serde::Serialize for AppError {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.user_message())
    }
}
