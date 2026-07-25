use std::net::SocketAddr;

use migration::MigratorTrait;
use reqwest::{Client, StatusCode};
use sea_orm::{ConnectionTrait, Database, DatabaseBackend, DatabaseConnection, Statement};
use tokio::net::TcpListener;
use types::note::{CreateNoteRequest, Note, UpdateNoteRequest};
use uuid::Uuid;

fn test_db_url() -> String {
    std::env::var("TEST_DATABASE_URL").unwrap_or_else(|_| {
        "postgres://postgres:postgres@localhost:5432/tauri_app_template_test".into()
    })
}

fn split_db_url(url: &str) -> (String, String) {
    let i = url.rfind('/').expect("invalid database URL");
    (format!("{}/postgres", &url[..i]), url[i + 1..].to_string())
}

async fn create_test_db() -> DatabaseConnection {
    let url = test_db_url();
    let (admin_url, db_name) = split_db_url(&url);

    let admin = Database::connect(&admin_url)
        .await
        .expect("cannot connect to admin database — is PostgreSQL running?");

    let _ = admin
        .execute(Statement::from_string(
            DatabaseBackend::Postgres,
            format!(
                "SELECT pg_terminate_backend(pid) FROM pg_stat_activity \
                 WHERE datname = '{db_name}' AND pid <> pg_backend_pid()",
            ),
        ))
        .await;

    admin
        .execute(Statement::from_string(
            DatabaseBackend::Postgres,
            format!("DROP DATABASE IF EXISTS \"{db_name}\""),
        ))
        .await
        .expect("failed to drop test database");

    admin
        .execute(Statement::from_string(
            DatabaseBackend::Postgres,
            format!("CREATE DATABASE \"{db_name}\""),
        ))
        .await
        .expect("failed to create test database");

    drop(admin);

    let db = Database::connect(&url)
        .await
        .expect("failed to connect to test database");

    migration::Migrator::up(&db, None)
        .await
        .expect("migration failed");

    db
}

async fn spawn_app(db: DatabaseConnection) -> SocketAddr {
    let app = server::routes::create_router(db);
    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .expect("failed to bind");
    let addr = listener.local_addr().unwrap();
    tokio::spawn(async move { axum::serve(listener, app).await.unwrap() });
    addr
}

#[tokio::test]
async fn notes_crud() {
    let db = create_test_db().await;
    let addr = spawn_app(db).await;
    let client = Client::new();
    let base = format!("http://{addr}");

    // --- Create ---
    let note: Note = client
        .post(format!("{base}/api/notes"))
        .json(&CreateNoteRequest {
            title: "My Note".into(),
            content: "Hello, world!".into(),
        })
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();

    assert!(!note.id.is_nil());
    assert_eq!(note.title, "My Note");
    assert_eq!(note.content, "Hello, world!");

    let created_id = note.id;

    // --- List ---
    let notes: Vec<Note> = client
        .get(format!("{base}/api/notes"))
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();

    assert_eq!(notes.len(), 1);
    assert_eq!(notes[0].id, created_id);

    // --- Get by ID ---
    let fetched: Note = client
        .get(format!("{base}/api/notes/{created_id}"))
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();

    assert_eq!(fetched.id, created_id);
    assert_eq!(fetched.title, "My Note");

    // --- Update (partial) ---
    let updated: Note = client
        .put(format!("{base}/api/notes/{created_id}"))
        .json(&UpdateNoteRequest {
            title: Some("Updated Title".into()),
            content: None,
        })
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();

    assert_eq!(updated.title, "Updated Title");
    assert_eq!(updated.content, "Hello, world!");

    // --- Delete ---
    let resp = client
        .delete(format!("{base}/api/notes/{created_id}"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);

    // Confirm deletion
    let notes: Vec<Note> = client
        .get(format!("{base}/api/notes"))
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    assert_eq!(notes.len(), 0);

    // --- 404 for non-existent note ---
    let missing = Uuid::now_v7();
    for method in ["GET", "PUT", "DELETE"] {
        let req = match method {
            "GET" => client
                .get(format!("{base}/api/notes/{missing}"))
                .send()
                .await
                .unwrap(),
            "PUT" => client
                .put(format!("{base}/api/notes/{missing}"))
                .json(&UpdateNoteRequest {
                    title: None,
                    content: Some("x".into()),
                })
                .send()
                .await
                .unwrap(),
            "DELETE" => client
                .delete(format!("{base}/api/notes/{missing}"))
                .send()
                .await
                .unwrap(),
            _ => unreachable!(),
        };
        assert_eq!(
            req.status(),
            StatusCode::NOT_FOUND,
            "expected 404 for {method} on non-existent note",
        );
    }
}
