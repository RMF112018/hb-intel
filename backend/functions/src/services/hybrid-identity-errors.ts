/**
 * P9-04: Typed error categories for hybrid identity operations.
 *
 * These errors provide explicit classification for the source-of-authority
 * router, adapter invokers, and API response handlers in the Hybrid Identity
 * control lane. Each error carries a `code` property for programmatic handling
 * and a human-readable message for operator-facing feedback.
 */

/** Base class for all hybrid identity errors. */
export abstract class HybridIdentityError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// ─── Graph / Cloud-side errors ─────────────────────────────────────────────────

/** Graph API call failed due to missing or insufficient application permissions / admin consent. */
export class GraphPermissionError extends HybridIdentityError {
  readonly code = 'GRAPH_PERMISSION_INSUFFICIENT';

  constructor(operation: string, detail?: string) {
    super(
      `[Graph] ${operation}: insufficient permission or admin consent not granted.` +
      (detail ? ` ${detail}` : '') +
      ' Grant the required permission in the Entra admin portal.'
    );
  }
}

/** Transient Graph API failure (429, 5xx, timeout, network). */
export class GraphTransientError extends HybridIdentityError {
  readonly code = 'GRAPH_TRANSIENT';
  readonly statusCode?: number;
  readonly retryAfter?: number;

  constructor(operation: string, statusCode?: number, retryAfter?: number) {
    super(`[Graph] ${operation}: transient failure (HTTP ${statusCode ?? 'unknown'}). Retry later.`);
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
  }
}

// ─── AD DS / On-prem errors ────────────────────────────────────────────────────

/** AD DS execution failed due to insufficient service account privileges. */
export class ADDSPermissionError extends HybridIdentityError {
  readonly code = 'ADDS_PERMISSION_INSUFFICIENT';

  constructor(operation: string, detail?: string) {
    super(
      `[AD DS] ${operation}: insufficient service account permissions.` +
      (detail ? ` ${detail}` : '') +
      ' Verify the service account has delegated permissions on the target OU.'
    );
  }
}

/** Transient AD DS connectivity failure (unreachable, timeout, connection reset). */
export class ADDSConnectivityError extends HybridIdentityError {
  readonly code = 'ADDS_CONNECTIVITY';

  constructor(operation: string, detail?: string) {
    super(
      `[AD DS] ${operation}: connectivity failure.` +
      (detail ? ` ${detail}` : '') +
      ' Verify the network path from the Azure Function to the AD DS endpoint.'
    );
  }
}

/** AD DS authentication failure (invalid credentials, expired password, certificate error). */
export class ADDSAuthenticationError extends HybridIdentityError {
  readonly code = 'ADDS_AUTHENTICATION';

  constructor(operation: string, detail?: string) {
    super(
      `[AD DS] ${operation}: authentication failed.` +
      (detail ? ` ${detail}` : '') +
      ' Check the service account credentials in Connection Management.'
    );
  }
}

// ─── Source-of-authority errors ─────────────────────────────────────────────────

/** Attempted mutation against wrong authority (e.g., Graph mutation on AD-synced user). */
export class AuthorityMismatchError extends HybridIdentityError {
  readonly code = 'AUTHORITY_MISMATCH';

  constructor(operation: string, expectedAuthority: string, actualAuthority: string) {
    super(
      `[Authority] ${operation}: cannot execute. ` +
      `Object is ${actualAuthority}-authoritative but operation requires ${expectedAuthority} authority.`
    );
  }
}

/** Operation is not supported in this phase (deferred action). */
export class PhaseBoundaryError extends HybridIdentityError {
  readonly code = 'PHASE_BOUNDARY';

  constructor(operation: string) {
    super(
      `[Phase] ${operation}: this operation is not available in the current phase.`
    );
  }
}

/** Target object is protected, privileged, or constrained (role-assignable group, admin account). */
export class ProtectedTargetError extends HybridIdentityError {
  readonly code = 'PROTECTED_TARGET';

  constructor(operation: string, detail?: string) {
    super(
      `[Target] ${operation}: target is protected or constrained.` +
      (detail ? ` ${detail}` : '')
    );
  }
}

// ─── Common errors ─────────────────────────────────────────────────────────────

/** Target identity object not found. */
export class IdentityNotFoundError extends HybridIdentityError {
  readonly code = 'NOT_FOUND';

  constructor(objectType: string, identifier: string) {
    super(`[Identity] ${objectType} not found: ${identifier}`);
  }
}

/** Conflict / duplicate (e.g., creating a user that already exists). */
export class IdentityConflictError extends HybridIdentityError {
  readonly code = 'CONFLICT';

  constructor(operation: string, detail?: string) {
    super(
      `[Identity] ${operation}: conflict or duplicate.` +
      (detail ? ` ${detail}` : '')
    );
  }
}

/** Validation / bad request (missing required fields, invalid format). */
export class IdentityValidationError extends HybridIdentityError {
  readonly code = 'VALIDATION';

  constructor(operation: string, detail: string) {
    super(`[Identity] ${operation}: validation failed. ${detail}`);
  }
}

/** Sync is pending — cloud-side state may not yet reflect the on-prem mutation. */
export class SyncPendingError extends HybridIdentityError {
  readonly code = 'SYNC_PENDING';

  constructor(operation: string, detail?: string) {
    super(
      `[Sync] ${operation}: changes are pending sync propagation.` +
      (detail ? ` ${detail}` : '') +
      ' Azure AD Connect delta sync typically completes within 30 minutes.'
    );
  }
}

// ─── Connection errors ─────────────────────────────────────────────────────────

/** Connection not configured in the connection registry. */
export class ConnectionNotConfiguredError extends HybridIdentityError {
  readonly code = 'CONNECTION_NOT_CONFIGURED';

  constructor(connectorId: string) {
    super(
      `[Connection] Connector "${connectorId}" is not configured. ` +
      'Go to Connection Management in the Admin app to set it up.'
    );
  }
}

/** Connection exists but is unhealthy or has never been tested successfully. */
export class ConnectionUnhealthyError extends HybridIdentityError {
  readonly code = 'CONNECTION_UNHEALTHY';

  constructor(connectorId: string, lastError?: string) {
    super(
      `[Connection] Connector "${connectorId}" is unhealthy or untested.` +
      (lastError ? ` Last error: ${lastError}` : '') +
      ' Go to Connection Management to test the connection.'
    );
  }
}
