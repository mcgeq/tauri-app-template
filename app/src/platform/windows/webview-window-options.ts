import type { RouteWindowMeta, WindowCloseStrategy } from '@/routes/registry/route-types';

export interface WebviewWindowConstructorOptions {
  title?: string;
  url?: string;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
  maximizable?: boolean;
  minimizable?: boolean;
  closable?: boolean;
  center?: boolean;
  x?: number;
  y?: number;
  decorations?: boolean;
  transparent?: boolean;
  alwaysOnTop?: boolean;
  skipTaskbar?: boolean;
  shadow?: boolean;
  visible?: boolean;
}

export interface CreateWindowOptions extends WebviewWindowConstructorOptions {
  parent?: string;
}

interface RouteWindowOptions extends CreateWindowOptions {
  label?: string;
  titleKey?: string;
  preload?: boolean;
  closeStrategy?: WindowCloseStrategy;
  destroyDelayMs?: number;
}

interface RouteWindowWebviewOptions extends RouteWindowMeta {
  url?: string;
  title?: string;
}

export function buildWebviewWindowOptions(
  options: CreateWindowOptions | RouteWindowWebviewOptions,
): WebviewWindowConstructorOptions {
  const {
    label: _label,
    titleKey: _titleKey,
    preload: _preload,
    parent: _parent,
    closeStrategy: _closeStrategy,
    destroyDelayMs: _destroyDelayMs,
    ...windowOptions
  } = options as RouteWindowOptions;

  return {
    decorations: false,
    ...windowOptions,
    visible: false,
  };
}

export function buildCreateWindowOptionsFromRouteWindow(
  window: RouteWindowMeta,
  routePath: string,
  title: string,
): { label: string; options: CreateWindowOptions } {
  const {
    label,
    titleKey: _titleKey,
    preload: _preload,
    closeStrategy: _closeStrategy,
    destroyDelayMs: _destroyDelayMs,
    ...windowOptions
  } = window;

  return {
    label,
    options: {
      ...windowOptions,
      title,
      url: routePath,
    },
  };
}
