use tauri::{AppHandle, State};
use tracing::instrument;

use crate::app::state::AppState;
use crate::error::AppError;
use crate::response::ApiResponse;
use crate::services::task_service;

#[tauri::command]
#[instrument(skip(app, state))]
pub fn start_background_task(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<ApiResponse<()>, AppError> {
    let result = task_service::start_background_task(app, state.inner());
    result.map(|_| ApiResponse::ok())
}

#[tauri::command]
#[instrument(skip(state))]
pub fn cancel_background_task(
    state: State<'_, AppState>,
) -> Result<ApiResponse<()>, AppError> {
    let result = task_service::cancel_background_task(state.inner());
    result.map(|_| ApiResponse::ok())
}
