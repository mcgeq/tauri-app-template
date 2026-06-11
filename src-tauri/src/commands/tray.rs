use crate::error::AppError;
use crate::response::ApiResponse;
use crate::services::tray_service;
use tracing::instrument;

#[tauri::command]
#[instrument]
pub fn update_tray_menu(
    app: tauri::AppHandle,
    show_text: String,
    settings_text: String,
    quit_text: String,
) -> Result<ApiResponse<()>, AppError> {
    let result =
        tray_service::update_tray_menu(&app, &show_text, &settings_text, &quit_text);
    result.map(|_| ApiResponse::ok())
}
