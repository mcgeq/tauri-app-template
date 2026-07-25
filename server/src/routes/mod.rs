pub mod notes;

use axum::Router;
use sea_orm::DatabaseConnection;

pub fn create_router(db: DatabaseConnection) -> Router {
    Router::new()
        .nest("/api/notes", notes::routes())
        .with_state(db)
}
