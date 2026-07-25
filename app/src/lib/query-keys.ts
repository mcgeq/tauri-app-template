export const queryKeys = {
  appConfig: {
    all: ['appConfig'] as const,
  },
  greet: {
    all: ['greet'] as const,
    detail: (name: string) => ['greet', name] as const,
  },
} as const;
