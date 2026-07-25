use tauri::{Manager, Runtime, Window};
use tracing::error;

use crate::app::state::AppState;
use crate::services::window_behavior_service;

pub fn attach_main_close_rule<R: Runtime>(window: &Window<R>) {
    if window.label() != "main" {
        return;
    }

    let window_clone = window.clone();
    window.on_window_event(move |event| {
        if let tauri::WindowEvent::CloseRequested { api, .. } = event {
            let state = window_clone.state::<AppState>();
            let close_action = match window_behavior_service::get_config(state.inner()) {
                Ok(config) => config.close_action,
                Err(e) => {
                    error!("Failed to load window behavior config for close rule: {e}");
                    "tray".into()
                }
            };

            if close_action == "tray" {
                if let Err(e) = window_clone.hide() {
                    error!("Failed to hide window on close request: {e}");
                }
                api.prevent_close();
            }
        }
    });
}
