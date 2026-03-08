/// <reference types="vite/client" />

/**
 * Ambient declaration for @hbc/notification-intelligence (planned SF-10).
 * Package does not exist yet — this declaration satisfies TypeScript while
 * the lazy import in recordBicTransfer.ts gracefully degrades at runtime.
 * Remove this declaration once @hbc/notification-intelligence is scaffolded.
 */
declare module '@hbc/notification-intelligence' {
  export const notificationIntelligence: {
    registerEvent: (event: {
      tier: string;
      type: string;
      itemKey: string;
      recipientUserId: string;
      title: string;
      body: string;
      href?: string;
    }) => void;
  } | undefined;
}
