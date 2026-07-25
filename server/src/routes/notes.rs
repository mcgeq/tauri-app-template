use axum::{
    extract::{Path, State},
    routing::get,
    Json,
};
use sqlx::PgPool;
use types::note::{CreateNoteRequest, Note, UpdateNoteRequest};

use crate::error::AppError;

pub fn routes() -> axum::Router<PgPool> {
    axum::Router::new()
        .route("/", get(list_notes).post(create_note))
        .route("/{id}", get(get_note).put(update_note).delete(delete_note))
}

async fn list_notes(State(pool): State<PgPool>) -> Result<Json<Vec<Note>>, AppError> {
    let notes = sqlx::query_as::<_, Note>("SELECT * FROM notes ORDER BY updated_at DESC")
        .fetch_all(&pool)
        .await?;
    Ok(Json(notes))
}

async fn get_note(
    State(pool): State<PgPool>,
    Path(id): Path<i64>,
) -> Result<Json<Note>, AppError> {
    let note = sqlx::query_as::<_, Note>("SELECT * FROM notes WHERE id = $1")
        .bind(id)
        .fetch_optional(&pool)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Note {id} not found")))?;
    Ok(Json(note))
}

async fn create_note(
    State(pool): State<PgPool>,
    Json(req): Json<CreateNoteRequest>,
) -> Result<Json<Note>, AppError> {
    let note = sqlx::query_as::<_, Note>(
        "INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *",
    )
    .bind(&req.title)
    .bind(&req.content)
    .fetch_one(&pool)
    .await?;
    Ok(Json(note))
}

async fn update_note(
    State(pool): State<PgPool>,
    Path(id): Path<i64>,
    Json(req): Json<UpdateNoteRequest>,
) -> Result<Json<Note>, AppError> {
    let note = sqlx::query_as::<_, Note>(
        "UPDATE notes SET title = COALESCE($1, title), content = COALESCE($2, content), updated_at = NOW() WHERE id = $3 RETURNING *",
    )
    .bind(&req.title)
    .bind(&req.content)
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Note {id} not found")))?;
    Ok(Json(note))
}

async fn delete_note(
    State(pool): State<PgPool>,
    Path(id): Path<i64>,
) -> Result<Json<()>, AppError> {
    let result = sqlx::query("DELETE FROM notes WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await?;
    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Note {id} not found")));
    }
    Ok(Json(()))
}
