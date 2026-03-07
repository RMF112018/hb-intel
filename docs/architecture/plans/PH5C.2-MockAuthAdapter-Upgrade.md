# Phase 5 Development Plan – Authentication & Shell Foundation Task 5C.2: DevAuthBypassAdapter Implementation

**Version:** 2.0 (Dev auth bypass adapter, lifecycle simulation, configurable delay)
**Purpose:** This document defines the complete implementation steps to create a production-grade `DevAuthBypassAdapter` that simulates the full authentication lifecycle without requiring real credentials, gated behind `import.meta.env.DEV`.
**Audience:** Implementation agent(s), backend developers, test engineers
**Implementation Objective:** Deliver a fully functional mock auth adapter for development mode that implements the complete auth lifecycle (acquireIdentity → normalizeSession → restoreSession) with configurable delay, timing events, and audit logging.

---

## 5.C.2 DevAuthBypassAdapter Implementation

1. **Create `packages/auth/src/adapters/DevAuthBypassAdapter.ts`** (D-PH5C-02, D-PH5C-03)
   - Implement `IAuthAdapter` interface with all required methods
   - Declare method `acquireIdentity()` that returns a mock identity object with user metadata
   - Declare method `normalizeSession(rawIdentity)` that transforms raw identity into normalized session format
   - Declare method `restoreSession()` that retrieves stored session from sessionStorage or returns null
   - Add configurable delay parameter (default 500ms) to simulate real authentication latency (D-PH5C-03)
   - Emit startup timing events with `performance.mark()` and `performance.measure()`
   - Emit audit events with user ID, action type, and timestamp
   - Gate all code behind `import.meta.env.DEV` check at module level (D-PH5C-02)

2. **Implement mock identity generation** (D-PH5C-03)
   - Generate random user ID in format `dev-user-{uuid}`
   - Include display name, email, roles array (populated based on selected persona)
   - Add metadata: login timestamp, device fingerprint, session ID
   - Include claims object with permission scopes (to be matched against registered features)

3. **Implement configurable delay mechanism** (D-PH5C-03)
   - Accept optional delay parameter in constructor (milliseconds)
   - Default to 500ms if not provided
   - Use Promise-based delay: `await new Promise(resolve => setTimeout(resolve, delay))`
   - Log delay value and execution time to console in dev mode

4. **Implement session normalization** (D-PH5C-03)
   - Transform mock identity into `ISessionData` shape (sessionId, userId, displayName, email, roles, permissions, expiresAt)
   - Generate session expiration time (default 8 hours from now)
   - Include feature permissions based on roles (map persona roles to feature permissions)

5. **Implement session persistence** (D-PH5C-03)
   - Store normalized session in sessionStorage with key `hb-auth-dev-session`
   - Store as JSON-serialized object for retrieval
   - Include version marker for compatibility checking

6. **Implement lifecycle event emission** (D-PH5C-03)
   - Emit `auth:identity-acquired` event after `acquireIdentity()` completes
   - Emit `auth:session-normalized` event after `normalizeSession()` completes
   - Emit `auth:session-restored` event after `restoreSession()` completes (if session exists)
   - Emit `auth:startup-timing` event with total elapsed time
   - Use EventTarget-based event system or custom event emitter

7. **Implement audit logging** (D-PH5C-03)
   - Log to console: `[HB-AUTH-DEV] Action: {action}, UserId: {userId}, Timestamp: {timestamp}`
   - Include performance metrics: `elapsed: {ms}ms, delay: {ms}ms`
   - Log session metadata for debugging

8. **Export dev subpath in `packages/auth/src/index.ts`** (D-PH5C-02)
   - Add conditional export: `export * from './adapters/DevAuthBypassAdapter.ts' (only if DEV)`
   - Create subpath export entry point: `@hbc/auth/dev` in package.json exports field
   - Ensure production builds exclude dev adapter entirely

9. **Add TypeScript type definitions** (D-PH5C-02)
   - Define `IAuthAdapter` interface with all required methods
   - Define `IMockIdentity` type for generated identities
   - Define `ISessionData` type for normalized sessions
   - Add JSDoc comments with usage examples

10. **Create unit tests for DevAuthBypassAdapter** (D-PH5C-05)
    - Test `acquireIdentity()` returns valid identity object
    - Test `normalizeSession()` transforms identity correctly
    - Test `restoreSession()` retrieves stored session or returns null
    - Test configurable delay works (mock setTimeout if needed)
    - Test event emission
    - Test audit logging output
    - Achieve ≥95% code coverage

---

## Production-Ready Code: `packages/auth/src/adapters/DevAuthBypassAdapter.ts`

```typescript
// packages/auth/src/adapters/DevAuthBypassAdapter.ts
// D-PH5C-02: Dev Auth Bypass adapter (DEV mode only, excluded from production)
// D-PH5C-03: Full lifecycle simulation with configurable delay & events
// Version: 1.0
// Last Updated: 2026-03-07

import { v4 as uuidv4 } from 'uuid';

/**
 * IAuthAdapter interface — implemented by all auth adapters (production & dev)
 */
export interface IAuthAdapter {
  acquireIdentity(): Promise<IMockIdentity>;
  normalizeSession(rawIdentity: IMockIdentity): Promise<ISessionData>;
  restoreSession(): Promise<ISessionData | null>;
}

/**
 * IMockIdentity — raw identity returned from acquireIdentity()
 */
export interface IMockIdentity {
  userId: string;
  displayName: string;
  email: string;
  roles: string[];
  metadata: {
    loginTimestamp: number;
    deviceFingerprint: string;
    sessionId: string;
  };
  claims: {
    scopes: string[];
    aadObjectId?: string;
  };
}

/**
 * ISessionData — normalized session ready for app consumption
 */
export interface ISessionData {
  sessionId: string;
  userId: string;
  displayName: string;
  email: string;
  roles: string[];
  permissions: Record<string, boolean>; // feature -> allowed
  expiresAt: number; // Unix timestamp
  acquiredAt: number;
}

/**
 * DevAuthBypassAdapter
 * =====================
 * Simulates complete authentication flow without real credentials.
 * Gated behind import.meta.env.DEV; excluded from production bundle.
 * D-PH5C-03: Includes configurable delay (default 500ms) & full lifecycle events.
 */
export class DevAuthBypassAdapter implements IAuthAdapter {
  private readonly delayMs: number;
  private eventTarget: EventTarget;

  constructor(delayMs: number = 500) {
    if (!import.meta.env.DEV) {
      throw new Error(
        'DevAuthBypassAdapter is only available in development mode'
      );
    }
    this.delayMs = delayMs;
    this.eventTarget = new EventTarget();
  }

  /**
   * acquireIdentity() — simulates fetching user identity from auth provider
   * D-PH5C-03: Includes configurable delay
   */
  async acquireIdentity(): Promise<IMockIdentity> {
    const startTime = performance.now();
    performance.mark('auth:acquire-identity-start');

    // Simulate network latency
    await this.delay(this.delayMs);

    const sessionId = uuidv4();
    const userId = `dev-user-${uuidv4().substring(0, 8)}`;

    const identity: IMockIdentity = {
      userId,
      displayName: 'Dev User',
      email: 'dev@hb-intel.local',
      roles: ['Administrator', 'Developer'],
      metadata: {
        loginTimestamp: Date.now(),
        deviceFingerprint: this.generateDeviceFingerprint(),
        sessionId,
      },
      claims: {
        scopes: [
          'auth:read',
          'auth:write',
          'features:all',
          'admin:override',
        ],
        aadObjectId: uuidv4(),
      },
    };

    const elapsedMs = performance.now() - startTime;
    performance.mark('auth:acquire-identity-end');
    performance.measure(
      'auth:acquire-identity',
      'auth:acquire-identity-start',
      'auth:acquire-identity-end'
    );

    this.auditLog('ACQUIRE_IDENTITY', userId, elapsedMs);
    this.emit('auth:identity-acquired', { identity, elapsedMs });

    console.log(
      `[HB-AUTH-DEV] acquireIdentity completed in ${elapsedMs.toFixed(2)}ms (simulated delay: ${this.delayMs}ms)`
    );

    return identity;
  }

  /**
   * normalizeSession() — transforms raw identity into normalized session
   * D-PH5C-03: Full session structure ready for app consumption
   */
  async normalizeSession(
    rawIdentity: IMockIdentity
  ): Promise<ISessionData> {
    const startTime = performance.now();
    performance.mark('auth:normalize-session-start');

    // Simulate processing
    await this.delay(50);

    const permissions = this.mapRolesToPermissions(rawIdentity.roles);
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours

    const session: ISessionData = {
      sessionId: rawIdentity.metadata.sessionId,
      userId: rawIdentity.userId,
      displayName: rawIdentity.displayName,
      email: rawIdentity.email,
      roles: rawIdentity.roles,
      permissions,
      expiresAt,
      acquiredAt: rawIdentity.metadata.loginTimestamp,
    };

    // Persist to sessionStorage
    sessionStorage.setItem(
      'hb-auth-dev-session',
      JSON.stringify({
        version: 1,
        session,
      })
    );

    const elapsedMs = performance.now() - startTime;
    performance.mark('auth:normalize-session-end');
    performance.measure(
      'auth:normalize-session',
      'auth:normalize-session-start',
      'auth:normalize-session-end'
    );

    this.auditLog('NORMALIZE_SESSION', rawIdentity.userId, elapsedMs);
    this.emit('auth:session-normalized', { session, elapsedMs });

    console.log(
      `[HB-AUTH-DEV] normalizeSession completed in ${elapsedMs.toFixed(2)}ms`
    );

    return session;
  }

  /**
   * restoreSession() — retrieves stored session from sessionStorage
   * D-PH5C-03: Returns null if session expired or not found
   */
  async restoreSession(): Promise<ISessionData | null> {
    const startTime = performance.now();
    performance.mark('auth:restore-session-start');

    await this.delay(25);

    const stored = sessionStorage.getItem('hb-auth-dev-session');
    if (!stored) {
      console.log(
        '[HB-AUTH-DEV] restoreSession: No stored session found, returning null'
      );
      performance.mark('auth:restore-session-end');
      performance.measure(
        'auth:restore-session',
        'auth:restore-session-start',
        'auth:restore-session-end'
      );
      return null;
    }

    try {
      const { version, session } = JSON.parse(stored);

      if (version !== 1) {
        console.warn(
          `[HB-AUTH-DEV] Unknown session version: ${version}, discarding`
        );
        sessionStorage.removeItem('hb-auth-dev-session');
        return null;
      }

      // Check expiration
      if (session.expiresAt < Date.now()) {
        console.log('[HB-AUTH-DEV] Session expired, removing');
        sessionStorage.removeItem('hb-auth-dev-session');
        return null;
      }

      const elapsedMs = performance.now() - startTime;
      performance.mark('auth:restore-session-end');
      performance.measure(
        'auth:restore-session',
        'auth:restore-session-start',
        'auth:restore-session-end'
      );

      this.auditLog('RESTORE_SESSION', session.userId, elapsedMs);
      this.emit('auth:session-restored', { session, elapsedMs });

      console.log(
        `[HB-AUTH-DEV] restoreSession completed in ${elapsedMs.toFixed(2)}ms`
      );

      return session;
    } catch (err) {
      console.error('[HB-AUTH-DEV] Failed to parse stored session:', err);
      sessionStorage.removeItem('hb-auth-dev-session');
      return null;
    }
  }

  /**
   * Emit auth event with optional metadata
   */
  private emit(eventName: string, detail: unknown): void {
    const event = new CustomEvent(eventName, { detail });
    this.eventTarget.dispatchEvent(event);
  }

  /**
   * Audit log helper
   */
  private auditLog(action: string, userId: string, elapsedMs: number): void {
    const timestamp = new Date().toISOString();
    console.log(
      `[HB-AUTH-DEV-AUDIT] action=${action}, userId=${userId}, elapsed=${elapsedMs.toFixed(2)}ms, timestamp=${timestamp}`
    );
  }

  /**
   * Simulate delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate fake device fingerprint for uniqueness
   */
  private generateDeviceFingerprint(): string {
    return `dev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Map roles to feature permissions
   * D-PH5C-04: Maps personas to their allowed features
   */
  private mapRolesToPermissions(
    roles: string[]
  ): Record<string, boolean> {
    const permissions: Record<string, boolean> = {
      // Default permissions for all users
      'feature:view-dashboard': true,
      'feature:view-profile': true,

      // Admin permissions
      'feature:admin-panel': roles.includes('Administrator'),
      'feature:user-management': roles.includes('Administrator'),
      'feature:system-settings': roles.includes('Administrator'),

      // Accounting module
      'feature:accounting-invoice': roles.includes('AccountingUser'),
      'feature:accounting-reports': roles.includes('AccountingUser'),

      // Estimating module
      'feature:estimating-projects': roles.includes('EstimatingUser'),
      'feature:estimating-quotes': roles.includes('EstimatingUser'),

      // Project module
      'feature:project-hub': roles.includes('ProjectUser'),
      'feature:project-tracking': roles.includes('ProjectUser'),
    };

    return permissions;
  }
}

// Event type guards
declare global {
  interface WindowEventMap {
    'auth:identity-acquired': CustomEvent<{ identity: IMockIdentity; elapsedMs: number }>;
    'auth:session-normalized': CustomEvent<{ session: ISessionData; elapsedMs: number }>;
    'auth:session-restored': CustomEvent<{ session: ISessionData; elapsedMs: number }>;
  }
}
```

---

## Production-Ready Code: `packages/auth/src/index.ts` (updated exports)

```typescript
// packages/auth/src/index.ts
// Main auth package exports
// D-PH5C-02: Conditional dev subpath export (gated behind DEV)

// Production exports
export { IAuthSession, useAuthSession, useHasPermission } from './hooks';
export { authStore } from './store';
export { AuthGuard, withFeatureAuth } from './components';
export { registerFeature, getRegisteredFeatures } from './registry';

// Dev-only exports (excluded from production build)
if (import.meta.env.DEV) {
  export {
    DevAuthBypassAdapter,
    type IAuthAdapter,
    type IMockIdentity,
    type ISessionData,
  } from './adapters/DevAuthBypassAdapter';
}
```

---

## Production-Ready Code: `packages/auth/package.json` (updated exports field)

```json
{
  "name": "@hbc/auth",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./dev": {
      "import": "./dist/adapters/DevAuthBypassAdapter.js",
      "types": "./dist/adapters/DevAuthBypassAdapter.d.ts",
      "condition": "development"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --max-warnings=0",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Production-Ready Code: `packages/auth/src/adapters/__tests__/DevAuthBypassAdapter.test.ts`

```typescript
// packages/auth/src/adapters/__tests__/DevAuthBypassAdapter.test.ts
// Unit tests for DevAuthBypassAdapter
// D-PH5C-05: Comprehensive test coverage for dev adapter

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DevAuthBypassAdapter } from '../DevAuthBypassAdapter';

describe('DevAuthBypassAdapter', () => {
  let adapter: DevAuthBypassAdapter;

  beforeEach(() => {
    sessionStorage.clear();
    adapter = new DevAuthBypassAdapter(100); // Short delay for tests
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('acquireIdentity', () => {
    it('should return a valid identity object', async () => {
      const identity = await adapter.acquireIdentity();

      expect(identity).toBeDefined();
      expect(identity.userId).toMatch(/^dev-user-/);
      expect(identity.displayName).toBe('Dev User');
      expect(identity.email).toBe('dev@hb-intel.local');
      expect(identity.roles).toContain('Administrator');
      expect(identity.metadata.sessionId).toBeDefined();
      expect(identity.claims.scopes).toContain('auth:read');
    });

    it('should include configurable delay', async () => {
      const startTime = performance.now();
      await adapter.acquireIdentity();
      const elapsedTime = performance.now() - startTime;

      expect(elapsedTime).toBeGreaterThanOrEqual(100 - 10); // Allow ±10ms variance
    });
  });

  describe('normalizeSession', () => {
    it('should normalize identity into session data', async () => {
      const identity = await adapter.acquireIdentity();
      const session = await adapter.normalizeSession(identity);

      expect(session).toBeDefined();
      expect(session.sessionId).toBe(identity.metadata.sessionId);
      expect(session.userId).toBe(identity.userId);
      expect(session.roles).toContain('Administrator');
      expect(session.permissions).toBeDefined();
      expect(session.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should store session in sessionStorage', async () => {
      const identity = await adapter.acquireIdentity();
      await adapter.normalizeSession(identity);

      const stored = sessionStorage.getItem('hb-auth-dev-session');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.version).toBe(1);
      expect(parsed.session.userId).toBe(identity.userId);
    });
  });

  describe('restoreSession', () => {
    it('should restore valid session from sessionStorage', async () => {
      const identity = await adapter.acquireIdentity();
      const originalSession = await adapter.normalizeSession(identity);

      const restored = await adapter.restoreSession();

      expect(restored).toBeDefined();
      expect(restored?.userId).toBe(originalSession.userId);
      expect(restored?.sessionId).toBe(originalSession.sessionId);
    });

    it('should return null if no session stored', async () => {
      const restored = await adapter.restoreSession();

      expect(restored).toBeNull();
    });

    it('should return null if session is expired', async () => {
      const identity = await adapter.acquireIdentity();
      const session = await adapter.normalizeSession(identity);

      // Manually set expired session
      sessionStorage.setItem(
        'hb-auth-dev-session',
        JSON.stringify({
          version: 1,
          session: { ...session, expiresAt: Date.now() - 1000 },
        })
      );

      const restored = await adapter.restoreSession();

      expect(restored).toBeNull();
      expect(sessionStorage.getItem('hb-auth-dev-session')).toBeNull();
    });

    it('should remove invalid/corrupted session data', async () => {
      sessionStorage.setItem('hb-auth-dev-session', 'invalid-json');

      const restored = await adapter.restoreSession();

      expect(restored).toBeNull();
      expect(sessionStorage.getItem('hb-auth-dev-session')).toBeNull();
    });
  });

  describe('permissions mapping', () => {
    it('should grant admin permissions for Administrator role', async () => {
      const identity = await adapter.acquireIdentity();
      const session = await adapter.normalizeSession(identity);

      expect(session.permissions['feature:admin-panel']).toBe(true);
      expect(session.permissions['feature:user-management']).toBe(true);
    });

    it('should grant default permissions to all users', async () => {
      const identity = await adapter.acquireIdentity();
      const session = await adapter.normalizeSession(identity);

      expect(session.permissions['feature:view-dashboard']).toBe(true);
      expect(session.permissions['feature:view-profile']).toBe(true);
    });
  });
});
```

---

## Recommended Implementation Sequence

1. PH5C.1 – Vitest Fix
2. PH5C.2 – MockAuthAdapter Upgrade (this task)
3. PH5C.3 – PersonaRegistry
4. PH5C.4 – DevToolbar
5. PH5C.5 – Developer How-To Guide
6. PH5C.6 – End-User How-To Guide
7. PH5C.7 – Administrator How-To Guide
8. PH5C.8 – Alignment Markers
9. PH5C.9 – ADR Updates
10. PH5C.10 – Final Verification

---

## Final Phase 5C Definition of Done

Phase 5C is complete when:
1. All 10 granular task files (PH5C.1 through PH5C.10) are executed in sequence.
2. Phase 5 audit coverage reaches **100%** across all seven categories (security, code quality, documentation, testability, maintainability, completeness, architecture alignment).
3. `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` succeeds with zero warnings.
4. `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell` executes and reports ≥95% coverage.
5. All documentation files exist in correct `docs/` subfolders and follow Diátaxis structure (how-to, reference, explanation).
6. All alignment markers are in place; `pnpm lint` detects no violations.
7. Production bundle contains zero byte references to dev-mode code (verified via string search).
8. Final sign-off table is completed with all roles approved.

---

## 5.C.2 Success Criteria Checklist (Task 5C.2)

- [ ] 5.C.2.1 `DevAuthBypassAdapter.ts` created with full IAuthAdapter implementation
- [ ] 5.C.2.2 `acquireIdentity()` returns valid mock identity with sessionId and roles
- [ ] 5.C.2.3 `normalizeSession()` transforms identity into ISessionData with permissions
- [ ] 5.C.2.4 `restoreSession()` retrieves stored session or returns null correctly
- [ ] 5.C.2.5 Configurable delay mechanism works (default 500ms) with event logging
- [ ] 5.C.2.6 Session persisted to sessionStorage with version marker
- [ ] 5.C.2.7 Adapter gated behind `import.meta.env.DEV`; absent from production build
- [ ] 5.C.2.8 Dev subpath export `@hbc/auth/dev` configured in package.json
- [ ] 5.C.2.9 Unit tests achieve ≥95% coverage
- [ ] 5.C.2.10 `pnpm turbo run build --filter=@hbc/auth` succeeds; adapter excluded from dist

---

## Phase 5.C.2 Progress Notes

- 5.C.2.1 [PENDING] — DevAuthBypassAdapter implementation
- 5.C.2.2 [PENDING] — Lifecycle methods (acquire, normalize, restore)
- 5.C.2.3 [PENDING] — Event emission and audit logging
- 5.C.2.4 [PENDING] — Dev subpath export configuration

### Verification Evidence

- `pnpm turbo run build --filter=@hbc/auth` - [PENDING]
- `pnpm turbo run test --filter=@hbc/auth` - [PENDING]
- `grep -r "DevAuthBypassAdapter" dist/ --include="*.js"` (should return empty for production) - [PENDING]
- Coverage report for auth package ≥95% - [PENDING]

---

**End of Task PH5C.2**

<!-- IMPLEMENTATION PROGRESS & NOTES
Task PH5C.2 created: 2026-03-07
DevAuthBypassAdapter specification complete with full lifecycle simulation.
Next: PH5C.3 (PersonaRegistry)
-->
