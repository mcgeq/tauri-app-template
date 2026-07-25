import { renderHook } from '@testing-library/react';
import { useAppTranslation } from '@/hooks/use-app-translation';

const translationHookTestState = vi.hoisted(() => ({
  isTauri: false,
  callbackSupport: false,
  changeLanguageMock: vi.fn(),
  onLanguageChangedMock: vi.fn().mockResolvedValue(vi.fn()),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: (...args: unknown[]) => translationHookTestState.changeLanguageMock(...args),
      language: 'en',
      resolvedLanguage: 'en',
    },
  }),
}));

vi.mock('@/api', () => ({
  onLanguageChanged: (...args: unknown[]) => translationHookTestState.onLanguageChangedMock(...args),
}));

vi.mock('@/platform/runtime/platform', () => ({
  get IS_TAURI_APP() {
    return translationHookTestState.isTauri;
  },
  get SUPPORTS_TAURI_CALLBACKS() {
    return translationHookTestState.callbackSupport;
  },
}));

describe('useAppTranslation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    translationHookTestState.isTauri = false;
    translationHookTestState.callbackSupport = false;
    translationHookTestState.onLanguageChangedMock.mockReset();
    translationHookTestState.onLanguageChangedMock.mockResolvedValue(vi.fn());
  });

  it('does not subscribe outside a Tauri runtime even if callback support is reported', () => {
    translationHookTestState.callbackSupport = true;
    const { result } = renderHook(() => useAppTranslation());

    expect(result.current.language).toBe('en');
    expect(translationHookTestState.onLanguageChangedMock).not.toHaveBeenCalled();
    expect(translationHookTestState.changeLanguageMock).not.toHaveBeenCalled();
  });

  it('subscribes to cross-window language sync when callbacks are available', () => {
    translationHookTestState.isTauri = true;
    translationHookTestState.callbackSupport = true;
    translationHookTestState.onLanguageChangedMock.mockImplementation((handler: (payload: { language: string }) => void) => {
      handler({ language: 'zh' });
      return Promise.resolve(vi.fn());
    });

    renderHook(() => useAppTranslation());

    expect(translationHookTestState.onLanguageChangedMock).toHaveBeenCalledTimes(1);
    expect(translationHookTestState.changeLanguageMock).toHaveBeenCalledWith('zh');
  });
});
