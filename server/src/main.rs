mod config;
mod db;
mod error;
mod routes;

use std::net::SocketAddr;

use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    dotenvy::dotenv().ok();

    let config = config::AppConfig::from_env();
    let pool = db::connect(&config.database_url)
        .await
        .expect("Failed to connect to database");

    let app = routes::create_router(pool)
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::new(
        config.host.parse().expect("Invalid host address"),
        config.port,
    );
    tracing::info!("Server starting on {addr}");

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind address");
    axum::serve(listener, app)
        .await
        .expect("Server failed");
}
