use crate::app::config::Config;
use crate::error::AppError;
use tracing::instrument;

#[tauri::command]
#[instrument]
pub fn get_app_config() -> Result<Config, AppError> {
    Ok(Config::get()?.clone())
}
