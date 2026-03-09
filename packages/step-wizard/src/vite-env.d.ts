/// <reference types="vite/client" />

/**
 * Ambient declaration for @hbc/session-state (planned SF-12).
 * Package does not exist yet — this declaration satisfies TypeScript while
 * vitest resolve aliases wire the mock for testing.
 * Remove this declaration once @hbc/session-state is scaffolded.
 */
declare module '@hbc/session-state' {
  export function useDraftStore(draftKey: string | null): {
    read<T>(): T | null;
    write(data: unknown): void;
  };
}

/**
 * Ambient declaration for @hbc/notification-intelligence (planned SF-10).
 * Package does not exist yet — this declaration satisfies TypeScript while
 * vitest resolve aliases wire the mock for testing.
 * Remove this declaration once @hbc/notification-intelligence is scaffolded.
 */
declare module '@hbc/notification-intelligence' {
  export function useNotificationClient(): {
    registerEvent(event: {
      tier: string;
      type: string;
      moduleKey: string;
      assigneeUserId?: string;
    }): void;
  };
}
