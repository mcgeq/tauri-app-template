let navigateToRoute: ((path: string) => void) | null = null;

export function setNavigateFn(fn: (path: string) => void) {
  navigateToRoute = fn;
}

export function navigateWindowFallback(path: string) {
  navigateToRoute?.(path);
}
