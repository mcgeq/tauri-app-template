import { invokeCommand } from './client';

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function listNotes(): Promise<Note[]> {
  return invokeCommand<Note[]>('list_notes');
}

export function createNote(title: string, content: string): Promise<Note> {
  return invokeCommand<Note>('create_note', { title, content });
}
