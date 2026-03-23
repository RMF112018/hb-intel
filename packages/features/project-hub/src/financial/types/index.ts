/**
 * P3-E4-T01 public contracts for Financial module doctrine and authority.
 * Contract-only surface: no data model fields here (T02–T08).
 */

// ── Financial Version States ──────────────────────────────────────────

/**
 * Version states specific to the Financial module (T01 §1.4).
 * Domain-specific and intentionally separate from @hbc/versioned-record VersionTag.
 * The financial module maps between these states and VersionTag at the integration boundary.
 */
export type FinancialVersionState =
  | 'Working'
  | 'ConfirmedInternal'
  | 'PublishedMonthly'
  | 'Superseded';

// ── Financial Roles ───────────────────────────────────────────────────

/**
 * Financial module authority roles (T01 §1.3).
 * Domain-scoped roles resolved from the app-level auth context.
 * They do not replace @hbc/auth app roles; they are a financial-specific projection.
 */
export type FinancialAuthorityRole =
  | 'PM'
  | 'PER'
  | 'Leadership';

// ── Access Actions ────────────────────────────────────────────────────

/** Actions that can be performed on a financial version. */
export type FinancialAccessAction =
  | 'read'
  | 'write'
  | 'annotate'
  | 'derive'
  | 'designate-report-candidate';

// ── Access Rule Resolution ────────────────────────────────────────────

export interface IFinancialAccessQuery {
  readonly role: FinancialAuthorityRole;
  readonly versionState: FinancialVersionState;
}

export interface IFinancialAccessResult {
  readonly allowed: ReadonlyArray<FinancialAccessAction>;
  readonly denied: ReadonlyArray<FinancialAccessAction>;
  /** True when the version is not visible at all to this role. */
  readonly hidden: boolean;
}

// ── Integration Boundary Contracts ────────────────────────────────────

/** Direction of data flow at the Financial module integration boundary (T01 §1.5). */
export type FinancialIntegrationDirection = 'inbound' | 'outbound';

export interface IFinancialIntegrationBoundary {
  readonly key: string;
  readonly direction: FinancialIntegrationDirection;
  readonly source: string;
  readonly target: string;
  readonly description: string;
  /** Whether this integration is currently active or planned for future implementation. */
  readonly status: 'active' | 'planned';
}
