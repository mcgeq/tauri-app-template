import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { createNote, listNotes } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NotesDemo() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: listNotes,
  });

  const createMutation = useMutation({
    mutationFn: () => createNote(title, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setTitle('');
      setContent('');
      toast.success('Note created');
    },
    onError: (err) => {
      toast.error(String(err));
    },
  });

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Notes (via axum server)</h2>
        <p className="text-muted-foreground text-sm">
          Verify end-to-end: Tauri invoke → Rust reqwest → axum → PostgreSQL
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <Input
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <Button
          onClick={() => createMutation.mutate()}
          disabled={!title || createMutation.isPending}
        >
          {createMutation.isPending ? 'Creating...' : 'Create Note'}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">
          Notes
          {' '}
          (
          {notes?.length ?? 0}
          )
        </h3>
        {isLoading && <p className="text-muted-foreground text-xs">Loading...</p>}
        {notes?.map(note => (
          <div key={note.id} className="bg-muted/50 rounded-md border p-3 text-left">
            <p className="text-sm font-medium">{note.title}</p>
            <p className="text-muted-foreground text-xs">{note.content}</p>
            <p className="text-muted-foreground mt-1 text-[10px]">
              {format(new Date(note.created_at), 'yyyy-MM-dd HH:mm:ss')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
