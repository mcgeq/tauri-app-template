use crate::app::config::Config;
use crate::app::state::AppState;
use crate::error::AppError;
use crate::logging;
use crate::logging::init_tracing_subscriber;
use crate::services::window_behavior_service;
use serde::Deserialize;
use tauri::Manager;

#[cfg(desktop)]
const EMBEDDED_TAURI_CONFIG: &str = include_str!("../../tauri.conf.json");
#[cfg(desktop)]
const UPDATER_ENDPOINT_PLACEHOLDER: &str = "__TAURI_UPDATER_ENDPOINT__";
#[cfg(desktop)]
const UPDATER_PUBKEY_PLACEHOLDER: &str = "__TAURI_UPDATER_PUBKEY__";

#[cfg(desktop)]
#[derive(Deserialize)]
struct EmbeddedTauriConfig {
    plugins: Option<EmbeddedPluginsConfig>,
}

#[cfg(desktop)]
#[derive(Deserialize)]
struct EmbeddedPluginsConfig {
    updater: Option<EmbeddedUpdaterConfig>,
}

#[cfg(desktop)]
#[derive(Deserialize)]
struct EmbeddedUpdaterConfig {
    pubkey: String,
    endpoints: Vec<String>,
}

#[cfg(desktop)]
fn is_absolute_updater_endpoint(endpoint: &str) -> bool {
    endpoint.starts_with("http://") || endpoint.starts_with("https://")
}

#[cfg(desktop)]
fn updater_config_is_ready(config_text: &str) -> bool {
    let Ok(config) = serde_json::from_str::<EmbeddedTauriConfig>(config_text) else {
        return false;
    };

    let Some(updater) = config.plugins.and_then(|plugins| plugins.updater) else {
        return false;
    };

    if updater.pubkey.trim().is_empty() || updater.pubkey == UPDATER_PUBKEY_PLACEHOLDER {
        return false;
    }

    !updater.endpoints.is_empty()
        && updater.endpoints.iter().all(|endpoint| {
            let trimmed = endpoint.trim();
            !trimmed.is_empty()
                && trimmed != UPDATER_ENDPOINT_PLACEHOLDER
                && is_absolute_updater_endpoint(trimmed)
        })
}

pub fn build() -> tauri::Builder<tauri::Wry> {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
}

#[cfg(desktop)]
pub fn with_desktop_plugins(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
    let builder = builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            crate::services::window_service::show_main_window(app);
        }))
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(crate::platform::system_tray::init());

    if updater_config_is_ready(EMBEDDED_TAURI_CONFIG) {
        builder.plugin(tauri_plugin_updater::Builder::new().build())
    } else {
        builder
    }
}

#[cfg(mobile)]
pub fn with_mobile_plugins(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
    builder.plugin(tauri_plugin_notification::init())
}

pub fn with_commands(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
    builder.invoke_handler(tauri::generate_handler![
        crate::commands::config::get_app_config,
        crate::commands::greet::greet,
        crate::commands::task::start_background_task,
        crate::commands::task::cancel_background_task,
        crate::commands::notification::send_notification,
        crate::commands::window_behavior::get_window_behavior_config,
        crate::commands::window_behavior::set_window_behavior_config,
        #[cfg(desktop)]
        crate::commands::tray::update_tray_menu,
    ])
}

pub fn setup<R: tauri::Runtime>(app: &mut tauri::App<R>) -> Result<(), AppError> {
    Config::init(app.handle())?;
    let log_config = logging::config::LogConfig::from_env();
    logging::cleanup::cleanup_old_logs(log_config.max_days)?;
    init_tracing_subscriber(&log_config)?;
    let state = AppState::new();
    window_behavior_service::hydrate_state(&state)?;
    app.manage(state);
    Ok(())
}

#[cfg(test)]
mod tests {
    #[cfg(desktop)]
    use super::updater_config_is_ready;

    #[cfg(desktop)]
    #[test]
    fn updater_config_is_not_ready_with_placeholders() {
        let config = r#"{
            "plugins": {
                "updater": {
                    "pubkey": "__TAURI_UPDATER_PUBKEY__",
                    "endpoints": ["__TAURI_UPDATER_ENDPOINT__"]
                }
            }
        }"#;

        assert!(!updater_config_is_ready(config));
    }

    #[cfg(desktop)]
    #[test]
    fn updater_config_is_not_ready_with_relative_endpoint() {
        let config = r#"{
            "plugins": {
                "updater": {
                    "pubkey": "real-pubkey",
                    "endpoints": ["/latest.json"]
                }
            }
        }"#;

        assert!(!updater_config_is_ready(config));
    }

    #[cfg(desktop)]
    #[test]
    fn updater_config_is_ready_with_real_pubkey_and_absolute_endpoint() {
        let config = r#"{
            "plugins": {
                "updater": {
                    "pubkey": "real-pubkey",
                    "endpoints": ["https://example.com/latest.json"]
                }
            }
        }"#;

        assert!(updater_config_is_ready(config));
    }
}
