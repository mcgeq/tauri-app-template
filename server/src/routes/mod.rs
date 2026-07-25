pub mod notes;

use axum::Router;
use sqlx::PgPool;

pub fn create_router(pool: PgPool) -> Router {
    Router::new()
        .nest("/api/notes", notes::routes())
        .with_state(pool)
}
