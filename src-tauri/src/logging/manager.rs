use tracing_subscriber::fmt::time::ChronoLocal;
use tracing_subscriber::{fmt, prelude::*, registry, EnvFilter};

use super::config::LogConfig;
use super::writer::DailyFileWriter;
use crate::error::AppError;

pub fn init_tracing_subscriber(config: &LogConfig) -> Result<(), AppError> {
    let tracing_dir = crate::config::Config::get()?.log_dir.join("tracing");

    let env_filter = EnvFilter::try_new(&config.level).unwrap_or_else(|_| EnvFilter::new("info"));

    // Console layer: human-readable compact format with RFC 3339 timestamps
    let console_layer = fmt::Layer::default()
        .with_writer(std::io::stdout)
        .with_ansi(true)
        .with_target(true)
        .with_level(true)
        .with_timer(ChronoLocal::rfc_3339())
        .compact()
        .with_filter(env_filter.clone());

    // App file layer: JSON format, all levels pass through env_filter
    let app_layer = fmt::Layer::default()
        .json()
        .with_writer(DailyFileWriter::new(tracing_dir.clone(), "app"))
        .with_filter(env_filter);

    // Error file layer: JSON format, error level only
    let error_layer = fmt::Layer::default()
        .json()
        .with_writer(DailyFileWriter::new(tracing_dir, "error"))
        .with_filter(EnvFilter::new("error"));

    let subscriber = registry()
        .with(console_layer)
        .with(app_layer)
        .with(error_layer);

    tracing::subscriber::set_global_default(subscriber).map_err(|error| {
        AppError::Generic(format!("Failed to set global tracing subscriber: {error}"))
    })?;

    Ok(())
}
