use tauri::{AppHandle, Emitter, Manager, Runtime};
use tracing::error;

const MAIN_WINDOW_LABEL: &str = "main";
const OPEN_SETTINGS_WINDOW_EVENT: &str = "open-settings-window";

pub fn show_main_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        if let Err(e) = window.show() {
            error!("Failed to show window: {e}");
        }
        if let Err(e) = window.unminimize() {
            error!("Failed to unminimize window: {e}");
        }
        if let Err(e) = window.set_focus() {
            error!("Failed to focus window: {e}");
        }
    }
}

pub fn emit_open_settings_window<R: Runtime>(app: &AppHandle<R>) {
    if let Err(e) = app.emit(OPEN_SETTINGS_WINDOW_EVENT, ()) {
        error!("Failed to emit open-settings-window event: {e}");
    }
}
