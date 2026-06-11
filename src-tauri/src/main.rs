// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    if let Err(e) = tauri_app_template_lib::run() {
        eprintln!("Failed to start Tauri application: {e}");
        std::process::exit(1);
    }
}
