use crate::error::AppError;
use crate::services::tray_service;
use tracing::instrument;

#[tauri::command]
#[instrument]
pub fn update_tray_menu(
    app: tauri::AppHandle,
    show_text: String,
    settings_text: String,
    quit_text: String,
) -> Result<(), AppError> {
    tray_service::update_tray_menu(&app, &show_text, &settings_text, &quit_text)
}
