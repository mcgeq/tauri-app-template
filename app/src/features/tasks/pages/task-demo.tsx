import { NotesDemo } from '@/features/tasks/components/notes-demo';
import { TaskDemo } from '@/features/tasks/components/task-demo';

export default function TasksPage() {
  return (
    <div className="flex min-h-0 w-full flex-1 items-start justify-center gap-8 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
      <TaskDemo />
      <NotesDemo />
    </div>
  );
}
