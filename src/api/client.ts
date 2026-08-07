import { invoke } from '@tauri-apps/api/core';

export interface InvokeCommandOptions {
  timeoutMs?: number;
}

export class CommandError extends Error {
  constructor(
    message: string,
    public command: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'CommandError';
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;

export async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>,
  options: InvokeCommandOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const invokePromise = invoke<T>(command, args);

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () =>
        reject(
          new CommandError(
            `Command "${command}" did not return within ${timeoutMs}ms and may still complete in the backend.`,
            command,
          ),
        ),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([invokePromise, timeoutPromise]);
  } catch (error) {
    if (error instanceof CommandError) throw error;
    throw new CommandError(
      `Command "${command}" failed: ${error instanceof Error ? error.message : String(error)}`,
      command,
      error,
    );
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
