import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import reactLogo from '@/assets/react.svg';
import tauriLogo from '@/assets/tauri.svg';
import viteLogo from '@/assets/vite.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGreet } from '@/features/home/hooks/use-greet';
import { useAppTranslation } from '@/hooks/use-app-translation';

function createGreetSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t('greet.nameRequired')),
  });
}

export default function HomePage() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { t } = useAppTranslation();
  const { mutateAsync: greet, isPending, data: greetMsg } = useGreet();

  async function handleGreet() {
    setError(null);
    const result = createGreetSchema(t).safeParse({ name });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    const msg = await greet(name);
    toast.success(msg);
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col justify-start overflow-y-auto overflow-x-hidden px-5 py-6 sm:p-8">
      <div className="flex min-h-full w-full flex-col items-center justify-center gap-6 text-center sm:gap-8">
        <div className="flex w-full max-w-xl flex-col items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t('app.welcome')}
          </h1>
          <p className="text-muted-foreground max-w-md text-sm leading-6 sm:text-base">
            {t('app.description')}
          </p>
        </div>

        <div className="flex w-full max-w-sm flex-nowrap items-center justify-center gap-3 sm:max-w-none sm:gap-8">
          <a
            href="https://vite.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
          >
            <img src={viteLogo} className="h-16 w-16 sm:h-24 sm:w-24" alt="Vite logo" />
          </a>
          <a
            href="https://tauri.app"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
          >
            <img src={tauriLogo} className="h-16 w-16 sm:h-24 sm:w-24" alt="Tauri logo" />
          </a>
          <a
            href="https://react.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
          >
            <img src={reactLogo} className="h-16 w-16 sm:h-24 sm:w-24" alt="React logo" />
          </a>
        </div>

        <div className="w-full max-w-md space-y-4">
          <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleGreet();
            }}
          >
            <div className="flex items-start gap-2">
              <div className="relative min-w-0 flex-1">
                <Input
                  id="greet-input"
                  value={name}
                  onChange={(e) => {
                    setName(e.currentTarget.value);
                    if (error)
                      setError(null);
                  }}
                  placeholder={t('greet.placeholder')}
                  className={error ? 'border-destructive' : ''}
                  aria-invalid={!!error}
                />
                {error && (
                  <p className="text-destructive absolute -bottom-5 text-xs">{error}</p>
                )}
              </div>
              <Button type="submit" disabled={isPending} className="h-9 shrink-0 px-3">
                {t('greet.button')}
              </Button>
            </div>
          </form>
          {greetMsg && <p className="bg-muted rounded-md p-3 text-sm">{greetMsg}</p>}
        </div>

        <div className="text-muted-foreground flex max-w-full flex-nowrap items-center justify-center gap-2 whitespace-nowrap text-[11px] sm:max-w-md sm:gap-4 sm:text-sm">
          <span>Tauri v2</span>
          <span>•</span>
          <span>React 19</span>
          <span>•</span>
          <span>TypeScript</span>
          <span>•</span>
          <span>Tailwind CSS v3</span>
          <span>•</span>
          <span>shadcn/ui</span>
        </div>
      </div>
    </div>
  );
}
