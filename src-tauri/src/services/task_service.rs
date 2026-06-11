use std::sync::atomic::Ordering;
use std::time::Duration;

use tauri::{AppHandle, Emitter, Manager};
use tracing::{error, info};

use crate::app::state::AppState;
use crate::error::AppError;
use crate::models::task::{TaskComplete, TaskProgress};

pub fn start_background_task(app: AppHandle, state: &AppState) -> Result<(), AppError> {
    if state.task_running.swap(true, Ordering::SeqCst) {
        return Err(AppError::Task(
            "A background task is already running".into(),
        ));
    }

    info!("Starting background task");
    std::thread::spawn(move || {
        let state = app.state::<AppState>();

        for i in 1..=5 {
            std::thread::sleep(Duration::from_secs(1));

            if !state.task_running.load(Ordering::SeqCst) {
                state.task_running.store(false, Ordering::SeqCst);
                info!("Background task cancelled, stopping early");
                return;
            }

            let payload = TaskProgress {
                progress: i * 20,
                message: format!("Step {} of 5", i),
            };
            if let Err(e) = app.emit("task-progress", payload) {
                error!(error = %e, "Failed to emit task-progress");
            }
        }

        let payload = TaskComplete {
            message: "Background task finished!".into(),
        };
        if let Err(e) = app.emit("task-complete", payload) {
            error!(error = %e, "Failed to emit task-complete");
        }

        state.task_running.store(false, Ordering::SeqCst);
        info!("Background task completed");
    });

    Ok(())
}

pub fn cancel_background_task(state: &AppState) -> Result<(), AppError> {
    if !state.task_running.load(Ordering::SeqCst) {
        return Err(AppError::Task("No task is currently running".into()));
    }

    state.task_running.store(false, Ordering::SeqCst);
    info!("Background task cancelled");
    Ok(())
}
