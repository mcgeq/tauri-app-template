[Root](../CLAUDE.md) > **src-tauri**

# Backend Module (src-tauri)

## Responsibilities

System-level calls, native features, and cross-platform desktop app wrapper. Built with Tauri v2 + Rust for secure, high-performance desktop applications.

## Entry Points

- **Entry**: `src/main.rs`
- **App Logic**: `src/lib.rs`
- **Build Config**: `Cargo.toml`

```bash
pnpm tauri dev   # Development build
pnpm tauri build # Production build
```

## Commands

| Command            | Parameters                    | Returns    | Description                          |
| ------------------ | ----------------------------- | ---------- | ------------------------------------ |
| `greet`            | `name: &str`                  | `String`   | Example greeting command             |
| `update_tray_menu` | `show_text: String, quit_text: String` | `Result<(), String>` | Update tray menu with localized text |
| `start_background_task` | `app: AppHandle`          | `Result<(), String>` | Spawn thread, emit task-progress / task-complete events |

### Emit Event from Rust to Frontend

```rust
use tauri::Emitter;

#[tauri::command]
fn start_background_task(app: tauri::AppHandle) -> Result<(), String> {
    std::thread::spawn(move || {
        app.emit("task-progress", serde_json::json!({
            "progress": 50,
            "message": "Processing...",
        })).ok();
    });
    Ok(())
}
```

```typescript
// Frontend
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen<{ progress: number; message: string }>(
  'task-progress', (event) => {
    console.log(event.payload.progress);
  }
);
```

### Define Command

```rust
// src/lib.rs
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
```

### Call from Frontend

```typescript
import { invoke } from "@tauri-apps/api/core";

const result = await invoke("greet", { name: "World" });
// Returns: "Hello, World! You've been greeted from Rust!"
```

### Register Command

```rust
// src/lib.rs
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(plugins::system_tray::init())
        .invoke_handler(tauri::generate_handler![greet, update_tray_menu]);

    #[cfg(not(debug_assertions))]
    let builder = builder.plugin(tauri_plugin_updater::Builder::new().build());

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## Key Dependencies

| Package                     | Version | Purpose                              |
| --------------------------- | ------- | ------------------------------------ |
| tauri                       | 2       | Tauri framework core                 |
| tauri-plugin-opener         | 2       | Open external links                  |
| tauri-plugin-global-shortcut | 2      | Global keyboard shortcuts            |
| tauri-plugin-dialog         | 2       | Native file dialogs                  |
| tauri-plugin-shell          | 2       | Launch external processes            |
| tauri-plugin-process        | 2       | App lifecycle (exit, relaunch)       |
| tauri-plugin-store          | 2       | Persistent key-value store           |
| tauri-plugin-single-instance | 2      | Single instance enforcement          |
| tauri-plugin-updater        | 2       | Auto-update (release only)           |
| serde                       | 1       | Serialization framework              |
| serde_json                  | 1       | JSON serialization                   |
| tauri-build                 | 2       | Build scripts (dev)                  |

## Configuration

### tauri.conf.json

```json
{
  "productName": "tauri-app-template",
  "version": "0.0.1",
  "identifier": "com.mcgeq.qianyu",
  "build": {
    "beforeDevCommand": "pnpm dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "pnpm build",
    "frontendDist": "../dist"
  }
}
```

### capabilities/default.json

```json
{
  "identifier": "default",
  "windows": ["main", "about", "settings"],
  "permissions": [
    "core:default",
    "core:window:allow-close",
    "core:window:allow-minimize",
    "core:window:allow-maximize",
    "core:window:allow-hide",
    "core:window:allow-show",
    "core:window:allow-start-dragging",
    "core:event:allow-emit",
    "core:event:allow-listen",
    "core:webview:allow-create-webview-window",
    "opener:default",
    "global-shortcut:default",
    "dialog:default",
    "shell:default",
    "process:default",
    "store:default",
    "updater:default"
  ]
}
```

## Testing

```bash
cd src-tauri
cargo test
```

## Common Tasks

### Add New Command

1. Define in `src/lib.rs`:
```rust
#[tauri::command]
fn my_command(arg: &str) -> String {
    format!("Result: {}", arg)
}
```

2. Register:
```rust
.invoke_handler(tauri::generate_handler![greet, my_command])
```

### Add Plugin

1. Add to `Cargo.toml`:
```toml
[dependencies]
tauri-plugin-clipboard = "2"
```

2. Initialize:
```rust
.plugin(tauri_plugin_clipboard::init())
```

3. Update `capabilities/default.json`

### Configure App Icons

Icons in `icons/` directory:
- `icon.png` - Base icon
- `icon.ico` - Windows
- `icon.icns` - macOS
- Various PNG sizes for different platforms

## File Structure

```
src-tauri/
├── Cargo.toml           # Rust dependencies
├── tauri.conf.json      # Tauri app config
├── build.rs             # Build script
├── src/
│   ├── main.rs          # Entry point
│   ├── lib.rs           # App setup, command registration
│   └── plugins/
│       ├── mod.rs       # Plugin module declarations
│       └── system_tray.rs  # System tray plugin
├── capabilities/
│   └── default.json     # Permissions
└── icons/               # App icons
```
