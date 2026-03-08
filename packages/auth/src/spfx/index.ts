/**
 * @hbc/auth/spfx subpath entry point — Phase 7-BW-2.
 * WebPart files import from here: `import { bootstrapSpfxAuth } from '@hbc/auth/spfx'`
 *
 * IMPORTANT: Do NOT re-export from root @hbc/auth — would pull sp-webpart-base into PWA bundle.
 */
export { bootstrapSpfxAuth, getSpfxContext } from './SpfxContextAdapter.js';
