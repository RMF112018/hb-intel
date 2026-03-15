import type { AppRouter } from './index.js';
declare module '@tanstack/react-router' {
  interface Register { router: AppRouter; }
}
