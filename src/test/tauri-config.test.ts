import tauriConfig from '../../src-tauri/tauri.conf.json';

describe('tauri.conf.json mobile runtime compatibility', () => {
  it('allows the Tauri runtime inline script required on mobile', async () => {
    const config = tauriConfig as {
      app?: {
        security?: {
          csp?: string;
        };
      };
    };

    expect(config.app?.security?.csp).toContain("script-src 'self' 'unsafe-inline'");
  });

  it('does not expose the global tauri object by default', () => {
    const config = tauriConfig as {
      app?: {
        withGlobalTauri?: boolean;
      };
    };

    expect(config.app?.withGlobalTauri).toBe(false);
  });
});
