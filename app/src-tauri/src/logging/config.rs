pub struct LogConfig {
    pub level: String,
    pub max_days: i64,
}

impl LogConfig {
    pub fn from_env() -> Self {
        Self {
            level: std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
            max_days: std::env::var("LOG_MAX_DAYS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(30),
        }
    }
}
