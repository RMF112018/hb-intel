import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/*',
  'apps/pwa',
  'apps/hb-site-control',
  'backend/functions',
]);
