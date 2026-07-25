use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{
    plugin::{Builder, TauriPlugin},
    AppHandle, Runtime,
};

use crate::error::AppError;
use crate::platform::window_rules;
use crate::services::window_service;

const MENU_ID_SHOW: &str = "show";
const MENU_ID_SETTINGS: &str = "settings";
const MENU_ID_QUIT: &str = "quit";
const MENU_ID_SYSTEM_TRAY: &str = "system-tray";
const TRAY_ID_MAIN: &str = "main-tray";

pub fn update_tray_menu<R: Runtime>(
    app: &AppHandle<R>,
    show_text: &str,
    settings_text: &str,
    quit_text: &str,
) -> Result<(), crate::error::AppError> {
    let menu = Menu::with_id_and_items(
        app,
        MENU_ID_SYSTEM_TRAY,
        &[
            &MenuItem::with_id(app, MENU_ID_SHOW, show_text, true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, MENU_ID_SETTINGS, settings_text, true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, MENU_ID_QUIT, quit_text, true, None::<&str>)?,
        ],
    )?;

    if let Some(tray) = app.tray_by_id(TRAY_ID_MAIN) {
        tray.set_menu(Some(menu))?;
    }

    Ok(())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("system-tray")
        .setup(|app, _| {
            let menu = Menu::with_id_and_items(
                app,
                MENU_ID_SYSTEM_TRAY,
                &[
                    &MenuItem::with_id(app, MENU_ID_SHOW, "Show Window", true, None::<&str>)?,
                    &PredefinedMenuItem::separator(app)?,
                    &MenuItem::with_id(app, MENU_ID_SETTINGS, "Settings", true, None::<&str>)?,
                    &PredefinedMenuItem::separator(app)?,
                    &MenuItem::with_id(app, MENU_ID_QUIT, "Quit", true, None::<&str>)?,
                ],
            )?;

            let icon = app
                .default_window_icon()
                .cloned()
                .ok_or_else(|| AppError::Config("Default window icon not configured".into()))?;

            TrayIconBuilder::with_id(TRAY_ID_MAIN)
                .menu(&menu)
                .icon(icon)
                .tooltip("Tauri App Template")
                .show_menu_on_left_click(false)
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        window_service::show_main_window(&tray.app_handle());
                    }
                })
                .on_menu_event(|app, event| match event.id.as_ref() {
                    MENU_ID_SHOW => {
                        window_service::show_main_window(app);
                    }
                    MENU_ID_SETTINGS => {
                        window_service::emit_open_settings_window(app);
                    }
                    MENU_ID_QUIT => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;
            Ok(())
        })
        .on_window_ready(move |window| {
            window_rules::attach_main_close_rule(&window);
        })
        .build()
}
