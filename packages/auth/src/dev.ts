// packages/auth/src/dev.ts
// Dev-only auth adapter exports
// D-PH5C-02: Dedicated @hbc/auth/dev subpath entry to keep root index compile-safe

export {
  DevAuthBypassAdapter,
  type IAuthAdapter,
  type IMockIdentity,
  type ISessionData,
} from './adapters/DevAuthBypassAdapter.js';
