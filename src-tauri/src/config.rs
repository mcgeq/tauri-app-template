use std::path::PathBuf;
use std::sync::OnceLock;

use serde::Serialize;
use tauri::{AppHandle, Manager, Runtime};

use crate::error::AppError;

static CONFIG: OnceLock<Config> = OnceLock::new();

#[derive(Debug, Clone, Serialize)]
pub struct Config {
    pub data_dir: PathBuf,
    pub log_dir: PathBuf,
    pub config_dir: PathBuf,
}

impl Config {
    pub fn get() -> Result<&'static Config, AppError> {
        CONFIG
            .get()
            .ok_or_else(|| AppError::Config("Config not initialized".into()))
    }

    pub fn init<R: Runtime>(app: &AppHandle<R>) -> Result<(), AppError> {
        let data_dir = get_app_data_dir(app)?;
        let config_dir = get_app_config_dir(app)?;
        let log_dir = get_app_log_dir(app)?;

        for dir in [&data_dir, &log_dir, &config_dir] {
            std::fs::create_dir_all(dir).map_err(|e| AppError::Io {
                path: dir.clone(),
                source: e,
            })?;
        }

        CONFIG
            .set(Config { data_dir, log_dir, config_dir })
            .map_err(|_| AppError::Config("Config already initialized".into()))
    }
}

fn get_app_log_dir<R: Runtime>(_app: &AppHandle<R>) -> Result<PathBuf, AppError> {
    #[cfg(any(target_os = "ios", target_os = "android"))]
    {
        Ok(_app.path().data_dir()?.join("logs"))
    }

    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        let exe = std::env::current_exe().map_err(|e| AppError::Io {
            path: PathBuf::from("logs"),
            source: e,
        })?;
        let parent = exe.parent().ok_or_else(|| AppError::Io {
            path: PathBuf::from("logs"),
            source: std::io::Error::new(std::io::ErrorKind::NotFound, "no parent directory"),
        })?;
        Ok(parent.join("logs"))
    }
}

fn get_app_data_dir<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, AppError> {
    #[cfg(any(target_os = "ios", target_os = "android"))]
    {
        Ok(app.path().data_dir()?.join("data"))
    }

    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        Ok(app.path().data_dir()?.join(".tauri-app-template").join("data"))
    }
}

fn get_app_config_dir<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, AppError> {
    #[cfg(any(target_os = "ios", target_os = "android"))]
    {
        get_app_data_dir(app)
    }

    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        Ok(app.path().app_config_dir()?)
    }
}
