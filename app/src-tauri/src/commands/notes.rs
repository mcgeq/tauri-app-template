use types::{CreateNoteRequest, Note};

const SERVER_URL: &str = "http://127.0.0.1:3000";

#[tauri::command]
pub async fn list_notes() -> Result<Vec<Note>, String> {
    let url = format!("{SERVER_URL}/api/notes");
    let resp = reqwest::get(&url)
        .await
        .map_err(|e| format!("Failed to fetch notes: {e}"))?;
    let notes: Vec<Note> = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse notes: {e}"))?;
    Ok(notes)
}

#[tauri::command]
pub async fn create_note(title: String, content: String) -> Result<Note, String> {
    let url = format!("{SERVER_URL}/api/notes");
    let body = CreateNoteRequest { title, content };
    let client = reqwest::Client::new();
    let resp = client
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to create note: {e}"))?;
    let note: Note = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse created note: {e}"))?;
    Ok(note)
}
