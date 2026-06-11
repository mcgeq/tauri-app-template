use crate::app::config::Config;
use crate::error::AppError;
use crate::response::ApiResponse;
use tracing::instrument;

#[tauri::command]
#[instrument]
pub fn get_app_config() -> Result<ApiResponse<Config>, AppError> {
    Ok(ApiResponse::success(Config::get()?.clone()))
}
