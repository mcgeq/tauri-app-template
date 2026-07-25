use tauri::State;

use crate::app::state::AppState;
use crate::error::AppError;
use crate::services::window_behavior_service;

#[tauri::command]
pub fn get_window_behavior_config(
    state: State<'_, AppState>,
) -> Result<window_behavior_service::WindowBehaviorConfig, AppError> {
    window_behavior_service::get_config(state.inner())
}

#[tauri::command]
pub fn set_window_behavior_config(
    state: State<'_, AppState>,
    minimize_action: String,
    close_action: String,
) -> Result<(), AppError> {
    window_behavior_service::set_config_values(state.inner(), minimize_action, close_action)
}
