import { isTauri } from '@tauri-apps/api/core';
import type { Platform } from '@tauri-apps/plugin-os';
import { platform as getTauriPlatform } from '@tauri-apps/plugin-os';

const MOBILE_USER_AGENT_RE = /Android|iPhone|iPad|iPod|Mobile/i;
const DESKTOP_PLATFORMS = new Set<Platform>([
  'windows',
  'macos',
  'linux',
  'freebsd',
  'dragonfly',
  'netbsd',
  'openbsd',
  'solaris',
]);

type TauriWindow = Window &
  typeof globalThis & {
    __TAURI_INTERNALS__?: unknown;
  };

export interface PlatformInfo {
  isDesktop: boolean;
  isMobile: boolean;
  isTauri: boolean;
  osPlatform: Platform | 'unknown';
  supportsMultiWindow: boolean;
  supportsIpc: boolean;
  supportsTauriCallbacks: boolean;
}

export interface DetectPlatformOptions {
  userAgent?: string;
  tauri?: boolean;
  tauriInternals?: unknown;
  osPlatform?: Platform | 'unknown';
}

let cachedPlatformInfo: PlatformInfo | null = null;

function hasTransformCallback(
  tauriInternals: unknown,
): tauriInternals is { transformCallback: (...args: unknown[]) => unknown } {
  return (
    typeof tauriInternals === 'object' &&
    tauriInternals !== null &&
    'transformCallback' in tauriInternals &&
    typeof tauriInternals.transformCallback === 'function'
  );
}

function isDesktopPlatform(osPlatform: Platform | 'unknown') {
  return osPlatform !== 'unknown' && DESKTOP_PLATFORMS.has(osPlatform);
}

function guessPlatformFromUA(userAgent: string): Platform | 'unknown' {
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
  if (/android/i.test(userAgent)) return 'android';
  if (/windows/i.test(userAgent)) return 'windows';
  if (/macintosh|mac os x/i.test(userAgent)) return 'macos';
  if (/linux/i.test(userAgent)) return 'linux';
  return 'unknown';
}

function detectTauriRuntime() {
  try {
    return isTauri();
  } catch {
    return false;
  }
}

function resolvePlatform({
  userAgent,
  tauri,
  osPlatform,
}: {
  userAgent: string;
  tauri: boolean;
  osPlatform?: Platform | 'unknown';
}): Platform | 'unknown' {
  if (osPlatform !== undefined) {
    return osPlatform;
  }

  if (tauri) {
    try {
      return getTauriPlatform();
    } catch (error) {
      console.warn('Failed to get platform from Tauri:', error);
    }
  }

  return guessPlatformFromUA(userAgent);
}

function createPlatformInfo({
  userAgent = globalThis.navigator?.userAgent ?? '',
  tauri = detectTauriRuntime(),
  tauriInternals = (globalThis.window as TauriWindow | undefined)?.__TAURI_INTERNALS__,
  osPlatform,
}: DetectPlatformOptions = {}): PlatformInfo {
  const resolvedPlatform = resolvePlatform({
    userAgent,
    tauri,
    osPlatform,
  });
  const isDesktop = tauri ? isDesktopPlatform(resolvedPlatform) : !MOBILE_USER_AGENT_RE.test(userAgent);
  const isMobile = tauri ? !isDesktop : MOBILE_USER_AGENT_RE.test(userAgent);

  return {
    isDesktop,
    isMobile,
    isTauri: tauri,
    osPlatform: resolvedPlatform,
    supportsMultiWindow: tauri && isDesktopPlatform(resolvedPlatform),
    supportsIpc: tauri,
    supportsTauriCallbacks: !tauri || hasTransformCallback(tauriInternals),
  };
}

function hasOverrides(options: DetectPlatformOptions) {
  return (
    options.userAgent !== undefined ||
    options.tauri !== undefined ||
    options.tauriInternals !== undefined ||
    options.osPlatform !== undefined
  );
}

export function getPlatformInfo(): PlatformInfo {
  if (cachedPlatformInfo) {
    return cachedPlatformInfo;
  }

  cachedPlatformInfo = createPlatformInfo();
  return cachedPlatformInfo;
}

export function detectPlatform(options: DetectPlatformOptions = {}): PlatformInfo {
  return hasOverrides(options) ? createPlatformInfo(options) : getPlatformInfo();
}

export function resetPlatformCache(): void {
  cachedPlatformInfo = null;
}

export const PLATFORM_INFO = getPlatformInfo();

export const {
  isDesktop: IS_DESKTOP,
  isMobile: IS_MOBILE_DEVICE,
  isTauri: IS_TAURI_APP,
  supportsTauriCallbacks: SUPPORTS_TAURI_CALLBACKS,
} = PLATFORM_INFO;
