import { Loader2 } from 'lucide-react';

export function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
    </div>
  );
}
