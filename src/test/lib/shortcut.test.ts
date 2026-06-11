import { convertToShortcut } from '@/lib/shortcut';

function createKeyEvent(overrides: Partial<KeyboardEvent>): KeyboardEvent {
  return {
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    key: '',
    ...overrides,
  } as KeyboardEvent;
}

describe('convertToShortcut', () => {
  it('returns Ctrl+A for ctrl+key a', () => {
    const event = createKeyEvent({ ctrlKey: true, key: 'a' });
    expect(convertToShortcut(event)).toBe('Ctrl+A');
  });

  it('returns Cmd+Shift+Z for cmd+shift+z', () => {
    const event = createKeyEvent({ metaKey: true, shiftKey: true, key: 'z' });
    expect(convertToShortcut(event)).toBe('Cmd+Shift+Z');
  });

  it('maps arrow keys correctly', () => {
    const event = createKeyEvent({ ctrlKey: true, key: 'ArrowUp' });
    expect(convertToShortcut(event)).toBe('Ctrl+Up');
  });

  it('maps Escape to Esc', () => {
    const event = createKeyEvent({ ctrlKey: true, key: 'Escape' });
    expect(convertToShortcut(event)).toBe('Ctrl+Esc');
  });

  it('maps Space key', () => {
    const event = createKeyEvent({ ctrlKey: true, key: ' ' });
    expect(convertToShortcut(event)).toBe('Ctrl+Space');
  });

  it('returns empty string when no modifier key', () => {
    const event = createKeyEvent({ key: 'a' });
    expect(convertToShortcut(event)).toBe('');
  });

  it('ignores standalone modifier keys', () => {
    const event = createKeyEvent({ ctrlKey: true, key: 'Control' });
    expect(convertToShortcut(event)).toBe('Ctrl');
  });

  it('uses Ctrl when both Ctrl and Meta are pressed (ctrl takes precedence)', () => {
    const event = createKeyEvent({ ctrlKey: true, metaKey: true, key: 'k' });
    expect(convertToShortcut(event)).toBe('Ctrl+K');
  });
});
