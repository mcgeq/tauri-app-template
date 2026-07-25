use tauri::{AppHandle, State};
use tracing::instrument;

use crate::app::state::AppState;
use crate::error::AppError;
use crate::services::task_service;

#[tauri::command]
#[instrument(skip(app, state))]
pub fn start_background_task(app: AppHandle, state: State<'_, AppState>) -> Result<(), AppError> {
    task_service::start_background_task(app, state.inner())
}

#[tauri::command]
#[instrument(skip(state))]
pub fn cancel_background_task(state: State<'_, AppState>) -> Result<(), AppError> {
    task_service::cancel_background_task(state.inner())
}
