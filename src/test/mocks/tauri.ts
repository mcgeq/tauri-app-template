type InvokeHandler = (cmd: string, args?: Record<string, unknown>) => unknown;

let invokeHandler: InvokeHandler = () => undefined;

export function __setInvokeHandler(handler: InvokeHandler) {
  invokeHandler = handler;
}

export function __resetInvokeHandler() {
  invokeHandler = () => undefined;
}

export async function invoke<T = unknown>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  return invokeHandler(cmd, args) as T;
}

interface MockCommand {
  cmd: string;
  response: unknown;
}

export function mockTauriCommands(commands: MockCommand[]) {
  __setInvokeHandler((cmd) => {
    const match = commands.find((c) => c.cmd === cmd);
    if (match) {
      return match.response;
    }
    throw new Error(`Unexpected Tauri command: ${cmd}`);
  });
}

export function mockTauriCommand(cmd: string, response: unknown) {
  mockTauriCommands([{ cmd, response }]);
}
