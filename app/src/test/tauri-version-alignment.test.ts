import packageJson from '../../package.json';

describe('tauri version alignment', () => {
  it('pins frontend Tauri packages to a single 2.11-compatible set', () => {
    expect(packageJson.dependencies['@tauri-apps/api']).toBe('2.11.0');
    expect(packageJson.dependencies['@tauri-apps/plugin-global-shortcut']).toBe('2.3.2');
    expect(packageJson.dependencies['@tauri-apps/plugin-opener']).toBe('2.5.4');
    expect(packageJson.dependencies['@tauri-apps/plugin-process']).toBe('2.3.1');
    expect(packageJson.dependencies['@tauri-apps/plugin-store']).toBe('2.4.3');
    expect(packageJson.dependencies['@tauri-apps/plugin-updater']).toBe('2.10.1');
    expect(packageJson.devDependencies['@tauri-apps/cli']).toBe('2.11.2');
  });
});
