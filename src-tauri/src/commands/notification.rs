use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;
use tracing::{error, info, instrument};

use crate::error::AppError;
use crate::response::ApiResponse;

#[tauri::command]
#[instrument(skip(app))]
pub fn send_notification(
    app: AppHandle,
    title: String,
    body: String,
) -> Result<ApiResponse<()>, AppError> {
    info!(title = %title, "Sending notification");

    let result = app
        .notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| {
            error!(error = %e, "Failed to send notification");
            AppError::Notification(e.to_string())
        });

    result.map(|_| ApiResponse::ok())
}
