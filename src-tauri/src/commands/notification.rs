use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;
use tracing::{error, info, instrument};

use crate::error::AppError;

#[tauri::command]
#[instrument(skip(app))]
pub fn send_notification(app: AppHandle, title: String, body: String) -> Result<(), AppError> {
    info!(title = %title, "Sending notification");

    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| {
            error!(error = %e, "Failed to send notification");
            AppError::Notification(e.to_string())
        })
}
