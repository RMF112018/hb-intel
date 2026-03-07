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
