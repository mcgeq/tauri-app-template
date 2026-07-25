import { invokeCommand } from './client';

export async function greet(name: string): Promise<string> {
  return invokeCommand<string>('greet', { name });
}
