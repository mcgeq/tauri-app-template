use tauri::{AppHandle, Runtime};

pub fn update_tray_menu<R: Runtime>(
    app: &AppHandle<R>,
    show_text: &str,
    settings_text: &str,
    quit_text: &str,
) -> Result<(), crate::error::AppError> {
    crate::platform::system_tray::update_tray_menu(app, show_text, settings_text, quit_text)
}
