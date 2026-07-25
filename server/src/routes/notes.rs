use axum::extract::{Path, State};
use axum::routing::get;
use axum::{Json, Router};
use sea_orm::ActiveValue::Set;
use sea_orm::{ActiveModelTrait, EntityTrait, QueryOrder};
use sea_orm::DatabaseConnection;
use types::note::{CreateNoteRequest, Note, UpdateNoteRequest};

use crate::entity::notes;
use crate::error::AppError;

pub fn routes() -> Router<DatabaseConnection> {
    Router::new()
        .route("/", get(list_notes).post(create_note))
        .route("/{id}", get(get_note).put(update_note).delete(delete_note))
}

async fn list_notes(State(db): State<DatabaseConnection>) -> Result<Json<Vec<Note>>, AppError> {
    let models = notes::Entity::find()
        .order_by_desc(notes::Column::UpdatedAt)
        .all(&db)
        .await?;

    let notes: Vec<Note> = models.into_iter().map(to_dto).collect();
    Ok(Json(notes))
}

async fn get_note(
    State(db): State<DatabaseConnection>,
    Path(id): Path<i64>,
) -> Result<Json<Note>, AppError> {
    let model = notes::Entity::find_by_id(id)
        .one(&db)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Note {id} not found")))?;

    Ok(Json(to_dto(model)))
}

async fn create_note(
    State(db): State<DatabaseConnection>,
    Json(req): Json<CreateNoteRequest>,
) -> Result<Json<Note>, AppError> {
    let model = notes::ActiveModel {
        title: Set(req.title),
        content: Set(req.content),
        ..Default::default()
    }
    .insert(&db)
    .await?;

    Ok(Json(to_dto(model)))
}

async fn update_note(
    State(db): State<DatabaseConnection>,
    Path(id): Path<i64>,
    Json(req): Json<UpdateNoteRequest>,
) -> Result<Json<Note>, AppError> {
    let note = notes::Entity::find_by_id(id)
        .one(&db)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Note {id} not found")))?;

    let mut active: notes::ActiveModel = note.into();
    if let Some(title) = req.title {
        active.title = Set(title);
    }
    if let Some(content) = req.content {
        active.content = Set(content);
    }
    active.updated_at = Set(chrono::Utc::now().into());

    let model = active.update(&db).await?;
    Ok(Json(to_dto(model)))
}

async fn delete_note(
    State(db): State<DatabaseConnection>,
    Path(id): Path<i64>,
) -> Result<Json<()>, AppError> {
    let result = notes::Entity::delete_by_id(id).exec(&db).await?;
    if result.rows_affected == 0 {
        return Err(AppError::NotFound(format!("Note {id} not found")));
    }
    Ok(Json(()))
}

fn to_dto(model: notes::Model) -> Note {
    Note {
        id: model.id,
        title: model.title,
        content: model.content,
        created_at: model.created_at.to_rfc3339(),
        updated_at: model.updated_at.to_rfc3339(),
    }
}
