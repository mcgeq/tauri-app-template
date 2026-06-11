use std::fs;

use chrono::{Duration, Local, NaiveDate};
use crate::error::AppError;

/// Remove log files under `{log_dir}/tracing/` older than `max_days`.
/// File format: `app.2025-06-07.log` or `error.2025-06-07.log`.
pub fn cleanup_old_logs(max_days: i64) -> Result<(), AppError> {
    let tracing_dir = crate::config::Config::get()?.log_dir.join("tracing");
    if !tracing_dir.exists() {
        return Ok(());
    }

    let cutoff = Local::now().naive_local().date() - Duration::days(max_days);

    let entries = match fs::read_dir(&tracing_dir) {
        Ok(e) => e,
        Err(_) => return Ok(()),
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }

        let name = match path.file_name().and_then(|s| s.to_str()) {
            Some(s) => s.to_string(),
            None => continue,
        };

        // Extract date from filename like "app.2025-06-07.log"
        let date_str = name
            .strip_suffix(".log")
            .and_then(|n| n.rsplit('.').next());
        if let Some(date_str) = date_str {
            if let Ok(date) = NaiveDate::parse_from_str(date_str, "%Y-%m-%d") {
                if date < cutoff {
                    let _ = fs::remove_file(&path);
                }
            }
        }
    }

    Ok(())
}
