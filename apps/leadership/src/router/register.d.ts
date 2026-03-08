import type { WebpartRouter } from './index.js';
declare module '@tanstack/react-router' {
  interface Register { router: WebpartRouter; }
}
