import { useEffect } from 'react';
import { create } from 'zustand';
import type { WindowBehaviorConfig } from '@/api/commands/window-behavior';
import { createWindowBehaviorRepository, DEFAULT_WINDOW_BEHAVIOR_CONFIG } from '@/stores/window-behavior-repository';

export type MinimizeAction = 'taskbar' | 'tray';
export type CloseAction = 'quit' | 'tray';

interface WindowBehaviorState {
  hydrated: boolean;
  minimizeAction: MinimizeAction;
  closeAction: CloseAction;
  setMinimizeAction: (action: MinimizeAction) => Promise<void>;
  setCloseAction: (action: CloseAction) => Promise<void>;
}

function currentConfig(state: Pick<WindowBehaviorState, 'minimizeAction' | 'closeAction'>): WindowBehaviorConfig {
  return {
    minimizeAction: state.minimizeAction,
    closeAction: state.closeAction,
  };
}

const repository = createWindowBehaviorRepository();

export const useWindowBehavior = create<WindowBehaviorState>()((set, get) => ({
  hydrated: false,
  ...DEFAULT_WINDOW_BEHAVIOR_CONFIG,
  setMinimizeAction: async (action: MinimizeAction) => {
    const previous = currentConfig(get());
    const next = { ...previous, minimizeAction: action };

    set({ minimizeAction: action });

    try {
      await repository.save(next);
    } catch (error) {
      console.error('Failed to persist window behavior config:', error);
      set(previous);
      return;
    }

    await repository.publish(next);
  },
  setCloseAction: async (action: CloseAction) => {
    const previous = currentConfig(get());
    const next = { ...previous, closeAction: action };

    set({ closeAction: action });

    try {
      await repository.save(next);
    } catch (error) {
      console.error('Failed to persist window behavior config:', error);
      set(previous);
      return;
    }

    await repository.publish(next);
  },
}));

export function useWindowBehaviorSync() {
  useEffect(() => {
    let cancelled = false;

    void repository
      .load()
      .then((config) => {
        if (!cancelled) {
          useWindowBehavior.setState({
            ...config,
            hydrated: true,
          });
        }
      })
      .catch((error) => {
        console.error('Failed to hydrate window behavior config:', error);
        if (!cancelled) {
          useWindowBehavior.setState({ hydrated: true });
        }
      });

    const unsubscribe = repository.subscribe((config) => {
      useWindowBehavior.setState({
        ...config,
        hydrated: true,
      });
    });

    return () => {
      cancelled = true;
      unsubscribe.then((fn) => fn());
    };
  }, []);
}
