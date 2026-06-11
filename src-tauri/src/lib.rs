mod app;
mod commands;
mod config;
mod error;
mod logging;
mod models;
mod platform;

#[cfg(desktop)]
mod plugins;

mod response;
mod services;
mod state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() -> Result<(), Box<dyn std::error::Error>> {
    let builder = app::bootstrap::build();

    #[cfg(desktop)]
    let builder = app::bootstrap::with_desktop_plugins(builder);

    #[cfg(mobile)]
    let builder = app::bootstrap::with_mobile_plugins(builder);

    let builder = app::bootstrap::with_commands(builder);

    builder
        .setup(|app| Ok(app::bootstrap::setup(app)?))
        .run(tauri::generate_context!())?;

    Ok(())
}
