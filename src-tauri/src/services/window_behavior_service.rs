use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::app::config::Config;
use crate::app::state::AppState;
use crate::error::AppError;

const WINDOW_BEHAVIOR_CONFIG_FILE: &str = "window-behavior.json";

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct WindowBehaviorConfig {
    pub minimize_action: String,
    pub close_action: String,
}

impl Default for WindowBehaviorConfig {
    fn default() -> Self {
        Self {
            minimize_action: "taskbar".into(),
            close_action: "tray".into(),
        }
    }
}

impl WindowBehaviorConfig {
    fn validate(&self) -> Result<(), AppError> {
        match self.minimize_action.as_str() {
            "taskbar" | "tray" => {}
            value => {
                return Err(AppError::Config(format!(
                    "Invalid minimize action: {value}"
                )));
            }
        }

        match self.close_action.as_str() {
            "quit" | "tray" => Ok(()),
            value => Err(AppError::Config(format!("Invalid close action: {value}"))),
        }
    }
}

fn config_path() -> Result<PathBuf, AppError> {
    Ok(Config::get()?.config_dir.join(WINDOW_BEHAVIOR_CONFIG_FILE))
}

fn read_state(
    state: &AppState,
) -> Result<std::sync::RwLockReadGuard<'_, WindowBehaviorConfig>, AppError> {
    state.window_behavior.read().map_err(|_| {
        AppError::Generic("Window behavior state read lock poisoned".into())
    })
}

fn write_state(
    state: &AppState,
) -> Result<std::sync::RwLockWriteGuard<'_, WindowBehaviorConfig>, AppError> {
    state.window_behavior.write().map_err(|_| {
        AppError::Generic("Window behavior state write lock poisoned".into())
    })
}

fn load_config_from_disk() -> Result<WindowBehaviorConfig, AppError> {
    let path = config_path()?;

    if !path.exists() {
        return Ok(WindowBehaviorConfig::default());
    }

    let contents = fs::read_to_string(&path).map_err(|source| AppError::Io {
        path: path.clone(),
        source,
    })?;

    let config: WindowBehaviorConfig = serde_json::from_str(&contents)
        .map_err(|error| AppError::Config(format!("Invalid window behavior config: {error}")))?;
    config.validate()?;
    Ok(config)
}

fn persist_config(config: &WindowBehaviorConfig) -> Result<(), AppError> {
    let path = config_path()?;
    let contents = serde_json::to_vec_pretty(config)
        .map_err(|error| AppError::Config(format!("Failed to serialize window behavior config: {error}")))?;

    fs::write(&path, contents).map_err(|source| AppError::Io { path, source })
}

pub fn hydrate_state(state: &AppState) -> Result<(), AppError> {
    let config = load_config_from_disk()?;
    *write_state(state)? = config;
    Ok(())
}

pub fn get_config(state: &AppState) -> Result<WindowBehaviorConfig, AppError> {
    Ok(read_state(state)?.clone())
}

pub fn set_config(state: &AppState, config: WindowBehaviorConfig) -> Result<(), AppError> {
    config.validate()?;
    *write_state(state)? = config.clone();
    persist_config(&config)?;
    Ok(())
}

pub fn set_config_values(
    state: &AppState,
    minimize_action: String,
    close_action: String,
) -> Result<(), AppError> {
    set_config(
        state,
        WindowBehaviorConfig {
            minimize_action,
            close_action,
        },
    )
}
