import { setLanguage, toggleLanguage } from '@/i18n/language';

const languageTestState = vi.hoisted(() => ({
  changeLanguageMock: vi.fn().mockResolvedValue(undefined),
  updateTrayMenuMock: vi.fn().mockResolvedValue(undefined),
  emitLanguageChangedMock: vi.fn().mockResolvedValue(undefined),
  isTauri: true,
  callbackSupport: true,
}));

vi.mock('@/i18n', () => ({
  default: {
    changeLanguage: (...args: unknown[]) => languageTestState.changeLanguageMock(...args),
    t: vi.fn((key: string, options?: { lng?: string }) => `${key}:${options?.lng ?? 'en'}`),
    hasResourceBundle: vi.fn().mockReturnValue(false),
    addResourceBundle: vi.fn(),
  },
}));

vi.mock('i18next', () => ({
  default: {
    hasResourceBundle: vi.fn().mockReturnValue(false),
    addResourceBundle: vi.fn(),
  },
}));

vi.mock('@/api', () => ({
  updateTrayMenu: (...args: unknown[]) => languageTestState.updateTrayMenuMock(...args),
  emitLanguageChanged: (...args: unknown[]) => languageTestState.emitLanguageChangedMock(...args),
}));

vi.mock('@/platform/runtime/platform', () => ({
  get IS_TAURI_APP() {
    return languageTestState.isTauri;
  },
  get SUPPORTS_TAURI_CALLBACKS() {
    return languageTestState.callbackSupport;
  },
}));

describe('language workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    languageTestState.isTauri = true;
    languageTestState.callbackSupport = true;
  });

  it('centralizes tray refresh and cross-window sync in setLanguage', async () => {
    await setLanguage('zh');

    expect(languageTestState.changeLanguageMock).toHaveBeenCalledWith('zh');
    expect(languageTestState.updateTrayMenuMock).toHaveBeenCalledWith({
      showText: 'tray.show:zh',
      settingsText: 'tray.settings:zh',
      quitText: 'tray.quit:zh',
    });
    expect(languageTestState.emitLanguageChangedMock).toHaveBeenCalledWith('zh');
  });

  it('toggles between the supported app languages', () => {
    expect(toggleLanguage('en')).toBe('zh');
    expect(toggleLanguage('zh')).toBe('en');
  });

  it('avoids Tauri event APIs outside a Tauri runtime', async () => {
    languageTestState.isTauri = false;
    languageTestState.callbackSupport = true;

    await setLanguage('en');

    expect(languageTestState.changeLanguageMock).toHaveBeenCalledWith('en');
    expect(languageTestState.updateTrayMenuMock).not.toHaveBeenCalled();
    expect(languageTestState.emitLanguageChangedMock).not.toHaveBeenCalled();
  });
});
