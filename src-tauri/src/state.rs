use std::sync::atomic::AtomicBool;
use std::sync::RwLock;

use crate::services::window_behavior_service::WindowBehaviorConfig;

pub struct AppState {
    pub task_running: AtomicBool,
    pub window_behavior: RwLock<WindowBehaviorConfig>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            task_running: AtomicBool::new(false),
            window_behavior: RwLock::new(WindowBehaviorConfig::default()),
        }
    }
}
