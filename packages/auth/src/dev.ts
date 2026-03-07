// packages/auth/src/dev.ts
// Dev-only auth adapter exports
// D-PH5C-02/D-PH5C-04: Dedicated @hbc/auth/dev subpath entry to keep root index
// compile-safe while exposing dev-only adapter and persona registry artifacts.

export {
  DevAuthBypassAdapter,
  type IAuthAdapter,
  type IMockIdentity,
  type ISessionData,
} from './adapters/DevAuthBypassAdapter.js';

export { PERSONA_REGISTRY, type IPersona } from './mock/personaRegistry.js';
