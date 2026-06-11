import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let mainActivitySource = '';
const filePath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../src-tauri/gen/android/app/src/main/java/com/mcgeq/qianyu/MainActivity.kt',
);

if (existsSync(filePath)) {
  mainActivitySource = readFileSync(filePath, 'utf8');
}

const describeIf = mainActivitySource ? describe : describe.skip;

describeIf('android main activity window behavior', () => {
  it('does not force the WebView to fit above the system bars', () => {
    expect(mainActivitySource).not.toContain('setDecorFitsSystemWindows(window, true)');
  });

  it('keeps soft-input resize enabled for the on-screen keyboard', () => {
    expect(mainActivitySource).toContain('SOFT_INPUT_ADJUST_RESIZE');
  });
});
