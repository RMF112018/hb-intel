# PH7-Estimating-Feature-Plan.md

> **Doc Classification:** Superseded / Archived Reference — v1.0 monolithic plan explicitly superseded by `PH7-Estimating-Features.md` v2.0, which split this content into numbered task files. Retained as archive for provenance only.
>
> **Status after consolidation:** SUPERSEDED (2026-03-07, per `PH7-Estimating-Features.md` v2.0 header)
> **Superseded by:** `docs/architecture/plans/PH7-Estimating-Features.md` v2.0 (master summary + task index) and the numbered task files in `docs/architecture/plans/ph7-estimating/`
> **Progress notes preserved at:** `docs/architecture/blueprint/HB-Intel-Blueprint-Crosswalk.md` §9.2
> **Do NOT use this document for implementation.** Use `PH7-Estimating-Features.md` and the `ph7-estimating/` task files.

**Phase 7 — Estimating Module: Complete Feature Build-Out**

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-07
**Derived from:** Structured product-owner interview (2026-03-07); all decisions locked.
**Audience:** Implementation agent(s), technical reviewers.
**Purpose:** Exhaustive, numbered, copy-paste-ready instructions for building every Estimating module feature. A developer unfamiliar with the project can execute this plan sequentially and produce a production-ready, fully tested, fully documented Estimating webpart.

---

## Locked Interview Decisions

| # | Topic | Decision |
|---|---|---|
| Q11 | Tracking table scope | All three tables (Current Pursuits, Current Preconstruction, Estimate Tracking Log) live in Estimating |
| Q11 | Preconstruction placement | Stays in Estimating — Project Hub is single-project context only (governing architectural rule) |
| Q12 | Kickoff / submission checklist | Lives in **Project Hub** at `/project-hub/:projectId/kickoff`; Estimating pursuit rows redirect there |
| Q13 | Bid Templates | **Option B** — curated, categorized SharePoint link library (no file storage in HB Intel) |
| Q14 | Estimate Tracking Log analytics | **Option C** — dedicated analytics view with charts, fiscal year comparisons, win-rate breakdown |
| Q15 | External platform integration | **Option B** — contextual deep links to Building Connected & Procore per project record; **Option C** (live API) documented for future |

### Governing Architectural Rule (from product-owner)
> "The Project Hub will contain features that use data for one unique project at a time. Tracking that includes multiple projects will never be included in the Project Hub."

This rule is the reason all three multi-project tracking tables live permanently in Estimating, and the kickoff (per-project) lives in the Project Hub.

---

## Prerequisites

- Phase 5C complete and signed off (auth, shell, PersonaRegistry, DevToolbar — all ✅ as of 2026-03-07)
- Phase 6 complete (provisioning backend, `@hbc/provisioning`, SignalR hub, request lifecycle API)
- Phase 7 Admin module complete (`PH7-Admin-Feature-Plan.md`)
- `apps/estimating` exists with placeholder pages: `BidsPage`, `TemplatesPage`, `ProjectSetupPage`
- `@hbc/models` estimating domain exists with minimal `IEstimatingTracker` and `IEstimatingKickoff`
- `@hbc/ui-kit` components available: `WorkspacePageShell`, `HbcDataTable`, `HbcStatusBadge`, `HbcButton`, `HbcCard`, `HbcModal`, `HbcTextField`, `HbcSelect`, `HbcPeoplePicker`, `HbcFormSection`, `HbcConfirmDialog`, `HbcToggle`
- `VITE_FUNCTION_APP_URL` environment variable set
- Estimating tracking spreadsheet analyzed and columns confirmed (2026-03-07 session)
- Estimating kickoff spreadsheet analyzed and structure confirmed (2026-03-07 session)

---

## Recommended Implementation Sequence

```
7-Estimating.1   → Data Models & Types (full expansion)
7-Estimating.2   → Route Structure & Navigation
7-Estimating.3   → Estimating Home Page
7-Estimating.4   → Active Pursuits Page
7-Estimating.5   → Active Preconstruction Page
7-Estimating.6   → Estimate Tracking Log Page
7-Estimating.7   → Estimate Analytics View
7-Estimating.8   → Templates Page (rebuilt from placeholder)
7-Estimating.9   → Cross-Module: Project Hub Kickoff Link Integration
7-Estimating.10  → External Platform Deep Links (Building Connected / Procore)
7-Estimating.11  → Backend API Endpoints
7-Estimating.12  → SharePoint List Schemas
7-Estimating.13  → Testing
7-Estimating.14  → Documentation & ADR
```

---

## 7-Estimating.1 — Data Models & Types

Replace the minimal existing interfaces in `packages/models/src/estimating/` with fully specified models derived from the actual tracking spreadsheets. Do not delete `IEstimatingTracker` or `IEstimatingKickoff` — replace their bodies with the expanded definitions below.

### 7-Estimating.1.1 — `packages/models/src/estimating/EstimatingEnums.ts`

Replace the existing file entirely:

```typescript
/**
 * Lifecycle status for an active pursuit (bid in progress).
 */
export enum PursuitStatus {
  /** Pursuit is active and being worked. */
  Active = 'Active',
  /** Bid has been submitted; awaiting decision. */
  Submitted = 'Submitted',
  /** Bid was awarded. */
  Awarded = 'Awarded',
  /** Bid was not awarded. */
  NotAwarded = 'NotAwarded',
  /** Pursuit placed on hold. */
  OnHold = 'OnHold',
  /** Pursuit withdrawn before submission. */
  Withdrawn = 'Withdrawn',
}

/**
 * Stage of an active preconstruction engagement.
 */
export enum PreconStage {
  Schematic = 'Schematic',
  DesignDevelopment = 'DD',
  FiftyPercentCD = '50% CD',
  GMP = 'GMP',
  Closed = 'Closed',
  OnHold = 'On Hold',
}

/**
 * Type of estimate / proposal submitted.
 * Matches values observed in the Estimate Tracking Log spreadsheet.
 */
export enum EstimateType {
  ConceptualEstimate = 'Conceptual Estimate',
  LumpSumProposal = 'Lump Sum Proposal',
  GMP = 'GMP Est',
  ROM = 'ROM',
  HardBid = 'Hard Bid',
  SDEstimate = 'SD Estimate',
  DesignBuild = 'Design Build',
  SchematicEstimate = 'Schematic Estimate',
}

/**
 * Outcome of a submitted estimate in the tracking log.
 */
export enum EstimateOutcome {
  Pending = 'Pending',
  AwardedWithPrecon = 'Awarded W Precon',
  AwardedWithoutPrecon = 'Awarded W/O Precon',
  NotAwarded = 'Not Awarded',
}

/**
 * How the proposal must be delivered.
 */
export enum ProposalDeliveryMethod {
  Email = 'email',
  HandDelivered = 'hand_delivered',
  OnlinePortal = 'online_portal',
}

/**
 * Fiscal year for analytics scoping.
 */
export enum FiscalYearScope {
  Current = 'current',
  Previous = 'previous',
  AllTime = 'all_time',
}
```

### 7-Estimating.1.2 — `packages/models/src/estimating/IActivePursuit.ts`

Create this new file:

```typescript
import type { PursuitStatus } from './EstimatingEnums.js';

/**
 * A single row in the Current Pursuits tracking table.
 * Derived from the "Master Sheet 2025" spreadsheet — Current Pursuits section.
 * These are projects HBC intends to submit a bid for.
 */
export interface IActivePursuit {
  /** UUID primary key. */
  id: string;
  /** Formatted project number (##-###-##). */
  projectNumber: string;
  /** Full project name. */
  projectName: string;
  /** Lead source (Owner direct, GC referral, public bid, etc.). */
  source?: string;
  /** Deliverable type (Lump Sum, GMP, Hard Bid, etc.). */
  deliverable?: string;
  /** ISO-8601 date subcontractor bids are due. */
  subBidsDue?: string;
  /** ISO-8601 date of the pre-submission estimate review meeting. */
  presubmissionReview?: string;
  /** ISO-8601 date of the win strategy meeting. */
  winStrategyMeeting?: string;
  /** ISO-8601 proposal due date (out the door). */
  dueDate: string;
  /** Azure AD UPN of the lead estimator. */
  leadEstimatorUpn: string;
  /** Display name of the lead estimator. */
  leadEstimatorName: string;
  /** Array of contributor UPNs (estimating team members). */
  contributorUpns: string[];
  /** Display names of contributors. */
  contributorNames: string[];
  /** Azure AD UPN of the Project Executive. */
  projectExecutiveUpn?: string;
  /** Display name of the Project Executive. */
  projectExecutiveName?: string;
  /** Current pursuit status. */
  status: PursuitStatus;

  // --- Checklist flags (high-level proposal readiness indicators) ---
  /** Bid bond status: true = obtained/N/A, false = outstanding. */
  checkBidBond: boolean;
  /** Performance & Payment Bond status. */
  checkPPBond: boolean;
  /** Schedule included. */
  checkSchedule: boolean;
  /** Logistics plan included. */
  checkLogistics: boolean;
  /** BIM proposal included. */
  checkBimProposal: boolean;
  /** Precon proposal included. */
  checkPreconProposal: boolean;
  /** Proposal tabs complete. */
  checkProposalTabs: boolean;
  /** Marketing coordination complete. */
  checkMarketingCoordination: boolean;
  /** Business terms reviewed. */
  checkBusinessTerms: boolean;

  // --- External platform integration (Option B: deep links) ---
  /** Direct URL to this project in Building Connected. */
  buildingConnectedUrl?: string;
  /** Direct URL to this project in Procore. */
  procoreUrl?: string;

  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last-updated timestamp. */
  updatedAt: string;
  /** UPN of the user who last updated this record. */
  updatedByUpn: string;
}

export interface IActivePursuitFormData {
  projectNumber: string;
  projectName: string;
  source?: string;
  deliverable?: string;
  subBidsDue?: string;
  presubmissionReview?: string;
  winStrategyMeeting?: string;
  dueDate: string;
  leadEstimatorUpn: string;
  contributorUpns: string[];
  projectExecutiveUpn?: string;
  buildingConnectedUrl?: string;
  procoreUrl?: string;
}
```

### 7-Estimating.1.3 — `packages/models/src/estimating/IActivePreconstruction.ts`

Create this new file:

```typescript
import type { PreconStage } from './EstimatingEnums.js';

/**
 * A single row in the Current Preconstruction tracking table.
 * These are projects where a preconstruction contract has been signed by the client.
 */
export interface IActivePreconstruction {
  /** UUID primary key. */
  id: string;
  /** Formatted project number (##-###-##). */
  projectNumber: string;
  /** Full project name. */
  projectName: string;
  /** Current preconstruction stage. */
  currentStage: PreconStage;
  /** Total precon contract budget in dollars. */
  preconBudget?: number;
  /** Total design budget in dollars. */
  designBudget?: number;
  /** Amount billed to client to date in dollars. */
  billedToDate?: number;
  /** Azure AD UPN of the lead estimator. */
  leadEstimatorUpn: string;
  /** Display name of the lead estimator. */
  leadEstimatorName: string;
  /** Azure AD UPN of the Project Executive. */
  projectExecutiveUpn?: string;
  /** Display name of the Project Executive. */
  projectExecutiveName?: string;
  /** Notes / comments. */
  notes?: string;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last-updated timestamp. */
  updatedAt: string;
  /** UPN of the user who last updated this record. */
  updatedByUpn: string;
}

export interface IActivePreconstructionFormData {
  projectNumber: string;
  projectName: string;
  currentStage: PreconStage;
  preconBudget?: number;
  designBudget?: number;
  billedToDate?: number;
  leadEstimatorUpn: string;
  projectExecutiveUpn?: string;
  notes?: string;
}
```

### 7-Estimating.1.4 — `packages/models/src/estimating/IEstimateLogEntry.ts`

Create this new file:

```typescript
import type { EstimateType, EstimateOutcome } from './EstimatingEnums.js';

/**
 * A single row in the Estimate Tracking Log.
 * The log is a historical record of every bid/estimate submitted for the fiscal year.
 */
export interface IEstimateLogEntry {
  /** UUID primary key. */
  id: string;
  /** Formatted project number (##-###-##). */
  projectNumber: string;
  /** Full project name. */
  projectName: string;
  /** Type of estimate or proposal submitted. */
  estimateType: EstimateType;
  /** Fiscal year this estimate belongs to (e.g., "2025"). */
  fiscalYear: string;
  /** Cost per gross square foot in dollars (optional — not always applicable). */
  costPerGsf?: number;
  /** Cost per unit in dollars (optional — residential projects). */
  costPerUnit?: number;
  /** ISO-8601 date the estimate was submitted. */
  submittedDate: string;
  /** Current outcome status. */
  outcome: EstimateOutcome;
  /** Dollar amount currently pending award decision. */
  amountPending?: number;
  /** Dollar amount awarded without preconstruction contract. */
  amountAwardedWithoutPrecon?: number;
  /** Dollar amount not awarded. */
  amountNotAwarded?: number;
  /** Dollar amount awarded with preconstruction contract. */
  amountAwardedWithPrecon?: number;
  /** Azure AD UPN of the lead estimator. */
  leadEstimatorUpn: string;
  /** Display name of the lead estimator. */
  leadEstimatorName: string;
  /** Free-text notes. */
  notes?: string;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last-updated timestamp. */
  updatedAt: string;
}

export interface IEstimateLogEntryFormData {
  projectNumber: string;
  projectName: string;
  estimateType: EstimateType;
  fiscalYear: string;
  costPerGsf?: number;
  costPerUnit?: number;
  submittedDate: string;
  outcome: EstimateOutcome;
  amountPending?: number;
  amountAwardedWithoutPrecon?: number;
  amountNotAwarded?: number;
  amountAwardedWithPrecon?: number;
  leadEstimatorUpn: string;
  notes?: string;
}
```

### 7-Estimating.1.5 — `packages/models/src/estimating/ITemplateLink.ts`

Create this new file:

```typescript
/**
 * A single entry in the curated bid template library.
 * Template files are stored in SharePoint; HB Intel stores the link only.
 * Option B decision: no file storage in HB Intel — curated SharePoint link library.
 */
export interface ITemplateLink {
  /** UUID primary key. */
  id: string;
  /** Display name of the template (e.g., "Front Cover — Lump Sum"). */
  title: string;
  /** Category matching the proposal deliverable structure. */
  category: TemplateLinkCategory;
  /** Full SharePoint URL to the template file. */
  sharePointUrl: string;
  /** File extension for icon display (docx, xlsx, pdf, etc.). */
  fileType: string;
  /** Optional description of when to use this template. */
  description?: string;
  /** Sort order within category. */
  sortOrder: number;
  /** Whether this template is currently active/visible. */
  isActive: boolean;
  /** ISO-8601 last-updated timestamp. */
  updatedAt: string;
  /** UPN of the admin who last updated this link. */
  updatedByUpn: string;
}

/**
 * Categories matching the standard proposal deliverable sections
 * from the Estimating Kickoff document.
 */
export enum TemplateLinkCategory {
  CoverAndSummary = 'Cover & Summary',
  CostBreakdowns = 'Cost Breakdowns',
  ClarificationsAndAllowances = 'Clarifications & Allowances',
  ScheduleAndLogistics = 'Schedule & Logistics',
  BimAndTechnology = 'BIM & Technology',
  TeamAndExperience = 'Team & Experience',
  LegalAndFinancial = 'Legal & Financial',
  Other = 'Other',
}
```

### 7-Estimating.1.6 — `packages/models/src/estimating/IEstimatingAnalytics.ts`

Create this new file:

```typescript
import type { EstimateType, EstimateOutcome, FiscalYearScope } from './EstimatingEnums.js';

/**
 * Aggregated analytics for the Estimate Tracking Log analytics view.
 * Computed server-side by the Azure Function analytics endpoint.
 * Option C decision: full analytics with charts and fiscal year comparisons.
 */
export interface IEstimatingAnalytics {
  /** Fiscal year label (e.g., "2025", "2024"). */
  fiscalYear: string;
  /** Total number of estimates submitted in this period. */
  totalSubmitted: number;
  /** Number with outcome = Awarded (either with or without precon). */
  totalAwarded: number;
  /** Number with outcome = Not Awarded. */
  totalNotAwarded: number;
  /** Number with outcome = Pending. */
  totalPending: number;
  /** Win rate percentage: totalAwarded / (totalAwarded + totalNotAwarded) * 100. Excludes pending. */
  winRatePercent: number;
  /** Total dollar value awarded (with + without precon). */
  totalAwardedValue: number;
  /** Total dollar value not awarded. */
  totalNotAwardedValue: number;
  /** Total dollar value pending. */
  totalPendingValue: number;
  /** Breakdown by estimate type. */
  byEstimateType: IEstimateTypeBreakdown[];
  /** Breakdown by lead estimator. */
  byEstimator: IEstimatorBreakdown[];
  /** Monthly submission volume for the fiscal year (12 entries). */
  monthlyVolume: IMonthlyVolume[];
}

export interface IEstimateTypeBreakdown {
  estimateType: EstimateType;
  count: number;
  winRate: number;
  totalAwardedValue: number;
}

export interface IEstimatorBreakdown {
  estimatorUpn: string;
  estimatorName: string;
  submitted: number;
  awarded: number;
  winRate: number;
  totalAwardedValue: number;
}

export interface IMonthlyVolume {
  /** Month label: "Jan", "Feb", etc. */
  month: string;
  /** Month number 1–12. */
  monthNumber: number;
  submitted: number;
  awarded: number;
}

export interface IEstimatingAnalyticsRequest {
  fiscalYearScope: FiscalYearScope;
  /** Specific fiscal year string if scope = specific (e.g., "2025"). */
  fiscalYear?: string;
}

/** Pair for fiscal year comparison view (current vs previous). */
export interface IEstimatingAnalyticsComparison {
  current: IEstimatingAnalytics;
  previous: IEstimatingAnalytics;
}
```

### 7-Estimating.1.7 — Update `packages/models/src/estimating/IEstimating.ts`

Replace the existing file with the expanded `IEstimatingTracker` (the old minimal version is superseded by `IActivePursuit` and `IEstimateLogEntry`). Retain backward-compatible re-exports.

```typescript
/**
 * @deprecated Use IActivePursuit for the Current Pursuits table.
 * Retained for backward compatibility during Phase 7 migration.
 */
export interface IEstimatingTracker {
  id: number;
  projectId: string;
  bidNumber: string;
  status: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * @deprecated Use IEstimatingKickoffRecord (in Project Hub models) for the full kickoff record.
 * The kickoff feature was moved to the Project Hub module (Q12 decision, 2026-03-07).
 * Retained for backward compatibility during migration.
 */
export interface IEstimatingKickoff {
  id: number;
  projectId: string;
  kickoffDate: string;
  attendees: string[];
  notes: string;
  createdAt: string;
}
```

### 7-Estimating.1.8 — Update `packages/models/src/estimating/index.ts`

Add barrel exports for all new interfaces:

```typescript
export * from './EstimatingEnums.js';
export * from './IEstimating.js';
export * from './IEstimatingFormData.js';
export * from './IActivePursuit.js';
export * from './IActivePreconstruction.js';
export * from './IEstimateLogEntry.js';
export * from './ITemplateLink.js';
export * from './IEstimatingAnalytics.js';
export * from './constants.js';
export * from './types.js';
```

---

## 7-Estimating.2 — Route Structure & Navigation

Replace `apps/estimating/src/router/routes.ts` entirely:

```typescript
import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

// ─── Home ────────────────────────────────────────────────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { useNavStore.getState().setActiveWorkspace('estimating'); },
  component: lazyRouteComponent(() =>
    import('../pages/EstimatingHomePage.js').then((m) => ({ default: m.EstimatingHomePage }))
  ),
});

// ─── Pursuits ─────────────────────────────────────────────────────────────────
const pursuitsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pursuits',
  component: lazyRouteComponent(() =>
    import('../pages/ActivePursuitsPage.js').then((m) => ({ default: m.ActivePursuitsPage }))
  ),
});

// ─── Preconstruction ──────────────────────────────────────────────────────────
const preconRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/preconstruction',
  component: lazyRouteComponent(() =>
    import('../pages/ActivePreconstructionPage.js').then((m) => ({ default: m.ActivePreconstructionPage }))
  ),
});

// ─── Estimate Tracking Log ────────────────────────────────────────────────────
const logRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/log',
  component: lazyRouteComponent(() =>
    import('../pages/EstimateTrackingLogPage.js').then((m) => ({ default: m.EstimateTrackingLogPage }))
  ),
});

// ─── Analytics ───────────────────────────────────────────────────────────────
const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/log/analytics',
  component: lazyRouteComponent(() =>
    import('../pages/EstimateAnalyticsPage.js').then((m) => ({ default: m.EstimateAnalyticsPage }))
  ),
});

// ─── Templates ───────────────────────────────────────────────────────────────
const templatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/templates',
  component: lazyRouteComponent(() =>
    import('../pages/TemplatesPage.js').then((m) => ({ default: m.TemplatesPage }))
  ),
});

// ─── Project Setup (Phase 6 — keep placeholder until PH6.10 executes) ────────
const projectSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/project-setup',
  component: lazyRouteComponent(() =>
    import('../pages/ProjectSetupPage.js').then((m) => ({ default: m.ProjectSetupPage }))
  ),
});

export const webpartRoutes = [
  indexRoute,
  pursuitsRoute,
  preconRoute,
  logRoute,
  analyticsRoute,
  templatesRoute,
  projectSetupRoute,
];
```

---

## 7-Estimating.3 — Estimating Home Page

Create `apps/estimating/src/pages/EstimatingHomePage.tsx`:

```typescript
import type { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  WorkspacePageShell,
  HbcCard,
  Text,
  HbcButton,
  HbcStatusBadge,
} from '@hbc/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { fetchEstimatingHomeSummary } from '../data/estimatingQueries.js';

/**
 * EstimatingHomePage — landing page for the Estimating workspace.
 *
 * Displays:
 * - Summary stat cards: active pursuits count, precon count, FY submitted count, FY win rate
 * - Quick navigation tiles to each sub-section
 * - Pursuits with due dates within 7 days (urgent callout)
 */
export function EstimatingHomePage(): ReactNode {
  const navigate = useNavigate();
  const { data: summary } = useQuery({
    queryKey: ['estimating', 'home-summary'],
    queryFn: fetchEstimatingHomeSummary,
  });

  const summaryCards = [
    { label: 'Active Pursuits', value: summary?.activePursuits ?? '—', variant: 'neutral' as const },
    { label: 'Active Precon', value: summary?.activePrecon ?? '—', variant: 'neutral' as const },
    { label: 'FY Submitted', value: summary?.fySubmitted ?? '—', variant: 'neutral' as const },
    { label: 'FY Win Rate', value: summary?.fyWinRate ? `${summary.fyWinRate}%` : '—', variant: 'success' as const },
  ];

  const navTiles = [
    { label: 'Current Pursuits', description: 'Active bids and proposal tracking', path: '/pursuits', icon: '📋' },
    { label: 'Preconstruction', description: 'Active precon engagements', path: '/preconstruction', icon: '🏗️' },
    { label: 'Estimate Log', description: 'FY historical record and analytics', path: '/log', icon: '📊' },
    { label: 'Templates', description: 'Proposal and deliverable templates', path: '/templates', icon: '📁' },
  ];

  return (
    <WorkspacePageShell layout="list" title="Estimating">
      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {summaryCards.map((card) => (
          <HbcCard key={card.label} size="small">
            <Text size={200} style={{ display: 'block', marginBottom: 4 }}>{card.label}</Text>
            <Text size={700} weight="bold">{card.value}</Text>
          </HbcCard>
        ))}
      </div>

      {/* Urgent pursuits callout — due within 7 days */}
      {summary?.urgentPursuits && summary.urgentPursuits.length > 0 && (
        <HbcCard style={{ marginBottom: 24, borderLeft: '4px solid var(--colorStatusWarningForeground1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Text weight="semibold">Due within 7 days</Text>
            <HbcStatusBadge label={`${summary.urgentPursuits.length} pursuit${summary.urgentPursuits.length > 1 ? 's' : ''}`} variant="warning" />
          </div>
          {summary.urgentPursuits.map((p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBlock: 4 }}>
              <Text>{p.projectNumber} — {p.projectName}</Text>
              <Text size={200} style={{ color: 'var(--colorStatusWarningForeground1)' }}>Due {p.dueDate}</Text>
            </div>
          ))}
        </HbcCard>
      )}

      {/* Navigation tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {navTiles.map((tile) => (
          <HbcCard
            key={tile.label}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate({ to: tile.path })}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{tile.icon}</div>
            <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 4 }}>{tile.label}</Text>
            <Text size={200} style={{ color: 'var(--colorNeutralForeground3)' }}>{tile.description}</Text>
          </HbcCard>
        ))}
      </div>
    </WorkspacePageShell>
  );
}
```

---

## 7-Estimating.4 — Active Pursuits Page

Create `apps/estimating/src/pages/ActivePursuitsPage.tsx`:

```typescript
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  WorkspacePageShell,
  HbcDataTable,
  HbcButton,
  HbcStatusBadge,
  HbcModal,
  HbcConfirmDialog,
  Text,
} from '@hbc/ui-kit';
import type { ColumnDef } from '@hbc/ui-kit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import type { IActivePursuit } from '@hbc/models';
import { PursuitStatus } from '@hbc/models';
import { fetchActivePursuits, createPursuit, updatePursuit, deletePursuit } from '../data/estimatingQueries.js';
import { PursuitForm } from '../components/PursuitForm.js';
import { PursuitChecklistInline } from '../components/PursuitChecklistInline.js';
import { ExternalPlatformLinks } from '../components/ExternalPlatformLinks.js';

/**
 * ActivePursuitsPage — Current Pursuits tracking table.
 *
 * Columns: Project #, Project Name, Deliverable, Sub Bids Due,
 *          Pre-Sub Review, Win Strategy, Due Date, Lead Estimator,
 *          Checklist Progress (inline badge), Actions.
 *
 * Row click → navigate to Project Hub kickoff at /project-hub/:projectId/kickoff.
 * Add / Edit / Delete available via toolbar and row actions.
 * External platform links (Building Connected, Procore) per row.
 */
export function ActivePursuitsPage(): ReactNode {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingPursuit, setEditingPursuit] = useState<IActivePursuit | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IActivePursuit | null>(null);

  const { data: pursuits = [], isLoading } = useQuery({
    queryKey: ['estimating', 'pursuits'],
    queryFn: fetchActivePursuits,
  });

  const createMutation = useMutation({
    mutationFn: createPursuit,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['estimating', 'pursuits'] }); setIsAddOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: updatePursuit,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['estimating', 'pursuits'] }); setEditingPursuit(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePursuit,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['estimating', 'pursuits'] }); setDeleteTarget(null); },
  });

  /** Navigate to this project's kickoff record in the Project Hub. */
  const handleRowClick = (pursuit: IActivePursuit) => {
    // Cross-module navigation: Estimating → Project Hub per-project kickoff.
    // Q12 decision: kickoff lives in Project Hub at /project-hub/:projectId/kickoff.
    navigate({ to: `/project-hub/${pursuit.projectNumber}/kickoff` });
  };

  const statusVariant = (status: PursuitStatus) => {
    const map: Record<PursuitStatus, 'success' | 'warning' | 'error' | 'neutral'> = {
      [PursuitStatus.Active]: 'neutral',
      [PursuitStatus.Submitted]: 'warning',
      [PursuitStatus.Awarded]: 'success',
      [PursuitStatus.NotAwarded]: 'error',
      [PursuitStatus.OnHold]: 'warning',
      [PursuitStatus.Withdrawn]: 'error',
    };
    return map[status] ?? 'neutral';
  };

  const columns: ColumnDef<IActivePursuit, unknown>[] = [
    { accessorKey: 'projectNumber', header: 'Project #', size: 110 },
    { accessorKey: 'projectName', header: 'Project Name', size: 220 },
    { accessorKey: 'deliverable', header: 'Deliverable', size: 140 },
    { accessorKey: 'subBidsDue', header: 'Sub Bids Due', size: 120 },
    { accessorKey: 'presubmissionReview', header: 'Pre-Sub Review', size: 130 },
    { accessorKey: 'winStrategyMeeting', header: 'Win Strategy', size: 120 },
    { accessorKey: 'dueDate', header: 'Due Date', size: 110 },
    { accessorKey: 'leadEstimatorName', header: 'Lead Estimator', size: 150 },
    {
      id: 'checklist',
      header: 'Checklist',
      size: 110,
      cell: ({ row }) => <PursuitChecklistInline pursuit={row.original} />,
    },
    {
      id: 'status',
      header: 'Status',
      size: 120,
      cell: ({ row }) => (
        <HbcStatusBadge label={row.original.status} variant={statusVariant(row.original.status)} />
      ),
    },
    {
      id: 'platforms',
      header: 'Links',
      size: 80,
      cell: ({ row }) => <ExternalPlatformLinks pursuit={row.original} />,
    },
    {
      id: 'actions',
      header: '',
      size: 80,
      cell: ({ row }) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <HbcButton
            size="small"
            appearance="subtle"
            onClick={(e) => { e.stopPropagation(); setEditingPursuit(row.original); }}
          >Edit</HbcButton>
          <HbcButton
            size="small"
            appearance="subtle"
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row.original); }}
          >Delete</HbcButton>
        </div>
      ),
    },
  ];

  return (
    <WorkspacePageShell layout="list" title="Current Pursuits">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text size={200} style={{ color: 'var(--colorNeutralForeground3)' }}>
          Click a row to open the project kickoff checklist in Project Hub.
        </Text>
        <HbcButton appearance="primary" onClick={() => setIsAddOpen(true)}>Add Pursuit</HbcButton>
      </div>

      <HbcDataTable<IActivePursuit>
        data={pursuits}
        columns={columns}
        isLoading={isLoading}
        height="calc(100vh - 240px)"
        onRowClick={handleRowClick}
        rowClickLabel="Open kickoff in Project Hub"
      />

      {/* Add modal */}
      <HbcModal
        open={isAddOpen}
        title="Add Pursuit"
        onClose={() => setIsAddOpen(false)}
      >
        <PursuitForm
          onSubmit={(data) => createMutation.mutate(data)}
          isSubmitting={createMutation.isPending}
          onCancel={() => setIsAddOpen(false)}
        />
      </HbcModal>

      {/* Edit modal */}
      <HbcModal
        open={!!editingPursuit}
        title="Edit Pursuit"
        onClose={() => setEditingPursuit(null)}
      >
        {editingPursuit && (
          <PursuitForm
            initialValues={editingPursuit}
            onSubmit={(data) => updateMutation.mutate({ id: editingPursuit.id, ...data })}
            isSubmitting={updateMutation.isPending}
            onCancel={() => setEditingPursuit(null)}
          />
        )}
      </HbcModal>

      {/* Delete confirm */}
      <HbcConfirmDialog
        open={!!deleteTarget}
        title="Remove Pursuit"
        message={`Remove "${deleteTarget?.projectName}" from Current Pursuits? This cannot be undone.`}
        confirmLabel="Remove"
        confirmVariant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isConfirming={deleteMutation.isPending}
      />
    </WorkspacePageShell>
  );
}
```

### 7-Estimating.4.1 — `PursuitChecklistInline` Component

Create `apps/estimating/src/components/PursuitChecklistInline.tsx`:

```typescript
import type { ReactNode } from 'react';
import type { IActivePursuit } from '@hbc/models';
import { HbcStatusBadge } from '@hbc/ui-kit';

const CHECKLIST_KEYS: (keyof IActivePursuit)[] = [
  'checkBidBond', 'checkPPBond', 'checkSchedule', 'checkLogistics',
  'checkBimProposal', 'checkPreconProposal', 'checkProposalTabs',
  'checkMarketingCoordination', 'checkBusinessTerms',
];

/**
 * Displays a compact readiness badge: "7/9 complete" with color coding.
 * Click navigates to full checklist in Project Hub — handled by row click on parent.
 */
export function PursuitChecklistInline({ pursuit }: { pursuit: IActivePursuit }): ReactNode {
  const completed = CHECKLIST_KEYS.filter((k) => pursuit[k] === true).length;
  const total = CHECKLIST_KEYS.length;
  const allDone = completed === total;
  const nearDone = completed >= total - 2;

  return (
    <HbcStatusBadge
      label={`${completed}/${total}`}
      variant={allDone ? 'success' : nearDone ? 'warning' : 'neutral'}
      title={`${completed} of ${total} checklist items complete. Click row to open full checklist.`}
    />
  );
}
```

### 7-Estimating.4.2 — `ExternalPlatformLinks` Component

Create `apps/estimating/src/components/ExternalPlatformLinks.tsx`:

```typescript
import type { ReactNode } from 'react';
import type { IActivePursuit } from '@hbc/models';
import { HbcButton } from '@hbc/ui-kit';

/**
 * Renders contextual deep-link buttons for Building Connected and Procore.
 * Option B decision: links only — no API data fetch.
 *
 * <!-- FUTURE OPTION C:
 *   Replace static link buttons with live data badges pulled from
 *   Building Connected API (sub bid response rate) and Procore API (open RFI count).
 *   Requires: BC API key management in Admin → System Settings,
 *   Procore OAuth flow per user, and @hbc/data-access BC/Procore adapters.
 *   Estimated effort: 2–3 sprints. ADR-0076 documents this future path.
 * -->
 */
export function ExternalPlatformLinks({ pursuit }: { pursuit: IActivePursuit }): ReactNode {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {pursuit.buildingConnectedUrl && (
        <HbcButton
          size="small"
          appearance="subtle"
          title="Open in Building Connected"
          onClick={(e) => {
            e.stopPropagation();
            window.open(pursuit.buildingConnectedUrl, '_blank', 'noopener noreferrer');
          }}
        >BC</HbcButton>
      )}
      {pursuit.procoreUrl && (
        <HbcButton
          size="small"
          appearance="subtle"
          title="Open in Procore"
          onClick={(e) => {
            e.stopPropagation();
            window.open(pursuit.procoreUrl, '_blank', 'noopener noreferrer');
          }}
        >PC</HbcButton>
      )}
    </div>
  );
}
```

---

## 7-Estimating.5 — Active Preconstruction Page

Create `apps/estimating/src/pages/ActivePreconstructionPage.tsx`:

```typescript
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  WorkspacePageShell,
  HbcDataTable,
  HbcButton,
  HbcStatusBadge,
  HbcModal,
  HbcConfirmDialog,
} from '@hbc/ui-kit';
import type { ColumnDef } from '@hbc/ui-kit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IActivePreconstruction } from '@hbc/models';
import { fetchActivePreconstruction, createPrecon, updatePrecon, deletePrecon } from '../data/estimatingQueries.js';
import { PreconForm } from '../components/PreconForm.js';

/** Format dollar values compactly: $1.2M, $450K. */
function formatCurrency(value?: number): string {
  if (value == null) return '—';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

/**
 * ActivePreconstructionPage — Current Preconstruction tracking table.
 *
 * Columns: Project #, Project Name, Stage, Precon Budget,
 *          Design Budget, Billed to Date, Lead Estimator, PX, Actions.
 *
 * Note: This table lives in Estimating (not Project Hub) per the governing
 * architectural rule: multi-project tracking tables never live in Project Hub.
 */
export function ActivePreconstructionPage(): ReactNode {
  const queryClient = useQueryClient();
  const [editingPrecon, setEditingPrecon] = useState<IActivePreconstruction | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IActivePreconstruction | null>(null);

  const { data: preconItems = [], isLoading } = useQuery({
    queryKey: ['estimating', 'preconstruction'],
    queryFn: fetchActivePreconstruction,
  });

  const createMutation = useMutation({
    mutationFn: createPrecon,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['estimating', 'preconstruction'] }); setIsAddOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: updatePrecon,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['estimating', 'preconstruction'] }); setEditingPrecon(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePrecon,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['estimating', 'preconstruction'] }); setDeleteTarget(null); },
  });

  const stageVariant = (stage: string): 'success' | 'warning' | 'error' | 'neutral' => {
    if (stage === 'Closed') return 'success';
    if (stage === 'On Hold') return 'warning';
    if (stage === 'GMP') return 'neutral';
    return 'neutral';
  };

  const columns: ColumnDef<IActivePreconstruction, unknown>[] = [
    { accessorKey: 'projectNumber', header: 'Project #', size: 110 },
    { accessorKey: 'projectName', header: 'Project Name', size: 240 },
    {
      id: 'stage',
      header: 'Stage',
      size: 130,
      cell: ({ row }) => (
        <HbcStatusBadge label={row.original.currentStage} variant={stageVariant(row.original.currentStage)} />
      ),
    },
    {
      id: 'preconBudget',
      header: 'Precon Budget',
      size: 130,
      cell: ({ row }) => formatCurrency(row.original.preconBudget),
    },
    {
      id: 'designBudget',
      header: 'Design Budget',
      size: 130,
      cell: ({ row }) => formatCurrency(row.original.designBudget),
    },
    {
      id: 'billedToDate',
      header: 'Billed to Date',
      size: 130,
      cell: ({ row }) => formatCurrency(row.original.billedToDate),
    },
    { accessorKey: 'leadEstimatorName', header: 'Lead Estimator', size: 150 },
    { accessorKey: 'projectExecutiveName', header: 'PX', size: 140 },
    {
      id: 'actions',
      header: '',
      size: 100,
      cell: ({ row }) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <HbcButton size="small" appearance="subtle" onClick={() => setEditingPrecon(row.original)}>Edit</HbcButton>
          <HbcButton size="small" appearance="subtle" onClick={() => setDeleteTarget(row.original)}>Delete</HbcButton>
        </div>
      ),
    },
  ];

  return (
    <WorkspacePageShell layout="list" title="Active Preconstruction">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <HbcButton appearance="primary" onClick={() => setIsAddOpen(true)}>Add Project</HbcButton>
      </div>

      <HbcDataTable<IActivePreconstruction>
        data={preconItems}
        columns={columns}
        isLoading={isLoading}
        height="calc(100vh - 220px)"
      />

      <HbcModal open={isAddOpen} title="Add Preconstruction Project" onClose={() => setIsAddOpen(false)}>
        <PreconForm onSubmit={(data) => createMutation.mutate(data)} isSubmitting={createMutation.isPending} onCancel={() => setIsAddOpen(false)} />
      </HbcModal>

      <HbcModal open={!!editingPrecon} title="Edit Preconstruction Project" onClose={() => setEditingPrecon(null)}>
        {editingPrecon && (
          <PreconForm
            initialValues={editingPrecon}
            onSubmit={(data) => updateMutation.mutate({ id: editingPrecon.id, ...data })}
            isSubmitting={updateMutation.isPending}
            onCancel={() => setEditingPrecon(null)}
          />
        )}
      </HbcModal>

      <HbcConfirmDialog
        open={!!deleteTarget}
        title="Remove Preconstruction Project"
        message={`Remove "${deleteTarget?.projectName}" from Active Preconstruction?`}
        confirmLabel="Remove"
        confirmVariant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isConfirming={deleteMutation.isPending}
      />
    </WorkspacePageShell>
  );
}
```

---

## 7-Estimating.6 — Estimate Tracking Log Page

Create `apps/estimating/src/pages/EstimateTrackingLogPage.tsx`:

```typescript
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  WorkspacePageShell,
  HbcDataTable,
  HbcButton,
  HbcStatusBadge,
  HbcModal,
  HbcSelect,
  Text,
} from '@hbc/ui-kit';
import type { ColumnDef } from '@hbc/ui-kit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IEstimateLogEntry } from '@hbc/models';
import { EstimateOutcome } from '@hbc/models';
import { fetchEstimateLog, createLogEntry, updateLogEntry } from '../data/estimatingQueries.js';
import { EstimateLogForm } from '../components/EstimateLogForm.js';

function formatCurrency(value?: number): string {
  if (value == null) return '—';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

const OUTCOME_VARIANT: Record<EstimateOutcome, 'success' | 'warning' | 'error' | 'neutral'> = {
  [EstimateOutcome.Pending]: 'warning',
  [EstimateOutcome.AwardedWithPrecon]: 'success',
  [EstimateOutcome.AwardedWithoutPrecon]: 'success',
  [EstimateOutcome.NotAwarded]: 'error',
};

const FISCAL_YEARS = ['2026', '2025', '2024', '2023'];

/**
 * EstimateTrackingLogPage — historical record of all estimates submitted.
 *
 * Features:
 * - Fiscal year filter (defaults to current FY)
 * - Sortable, filterable table matching spreadsheet columns
 * - Add / Edit log entries
 * - "View Analytics" button navigates to EstimateAnalyticsPage
 */
export function EstimateTrackingLogPage(): ReactNode {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fiscalYear, setFiscalYear] = useState('2026');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IEstimateLogEntry | null>(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['estimating', 'log', fiscalYear],
    queryFn: () => fetchEstimateLog(fiscalYear),
  });

  const createMutation = useMutation({
    mutationFn: createLogEntry,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['estimating', 'log'] }); setIsAddOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: updateLogEntry,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['estimating', 'log'] }); setEditingEntry(null); },
  });

  const columns: ColumnDef<IEstimateLogEntry, unknown>[] = [
    { accessorKey: 'projectNumber', header: 'Project #', size: 110 },
    { accessorKey: 'projectName', header: 'Project Name', size: 220 },
    { accessorKey: 'estimateType', header: 'Estimate Type', size: 170 },
    { accessorKey: 'submittedDate', header: 'Submitted', size: 110 },
    {
      id: 'outcome',
      header: 'Outcome',
      size: 160,
      cell: ({ row }) => (
        <HbcStatusBadge label={row.original.outcome} variant={OUTCOME_VARIANT[row.original.outcome]} />
      ),
    },
    {
      id: 'costPerGsf',
      header: '$/GSF',
      size: 90,
      cell: ({ row }) => row.original.costPerGsf != null ? `$${row.original.costPerGsf.toFixed(2)}` : '—',
    },
    {
      id: 'costPerUnit',
      header: '$/Unit',
      size: 90,
      cell: ({ row }) => formatCurrency(row.original.costPerUnit),
    },
    {
      id: 'awardedValue',
      header: 'Awarded Value',
      size: 130,
      cell: ({ row }) => {
        const v = (row.original.amountAwardedWithPrecon ?? 0) + (row.original.amountAwardedWithoutPrecon ?? 0);
        return v > 0 ? formatCurrency(v) : '—';
      },
    },
    { accessorKey: 'leadEstimatorName', header: 'Lead Estimator', size: 150 },
    { accessorKey: 'notes', header: 'Notes', size: 180 },
    {
      id: 'actions',
      header: '',
      size: 60,
      cell: ({ row }) => (
        <HbcButton size="small" appearance="subtle" onClick={() => setEditingEntry(row.original)}>Edit</HbcButton>
      ),
    },
  ];

  return (
    <WorkspacePageShell layout="list" title="Estimate Tracking Log">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Text weight="semibold">Fiscal Year</Text>
          <HbcSelect
            value={fiscalYear}
            onChange={setFiscalYear}
            options={FISCAL_YEARS.map((y) => ({ value: y, label: y }))}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <HbcButton appearance="outline" onClick={() => navigate({ to: '/log/analytics' })}>
            View Analytics
          </HbcButton>
          <HbcButton appearance="primary" onClick={() => setIsAddOpen(true)}>Add Entry</HbcButton>
        </div>
      </div>

      <HbcDataTable<IEstimateLogEntry>
        data={entries}
        columns={columns}
        isLoading={isLoading}
        height="calc(100vh - 240px)"
      />

      <HbcModal open={isAddOpen} title="Add Log Entry" onClose={() => setIsAddOpen(false)}>
        <EstimateLogForm onSubmit={(data) => createMutation.mutate(data)} isSubmitting={createMutation.isPending} onCancel={() => setIsAddOpen(false)} />
      </HbcModal>

      <HbcModal open={!!editingEntry} title="Edit Log Entry" onClose={() => setEditingEntry(null)}>
        {editingEntry && (
          <EstimateLogForm
            initialValues={editingEntry}
            onSubmit={(data) => updateMutation.mutate({ id: editingEntry.id, ...data })}
            isSubmitting={updateMutation.isPending}
            onCancel={() => setEditingEntry(null)}
          />
        )}
      </HbcModal>
    </WorkspacePageShell>
  );
}
```

---

## 7-Estimating.7 — Estimate Analytics View

Create `apps/estimating/src/pages/EstimateAnalyticsPage.tsx`:

```typescript
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  WorkspacePageShell,
  HbcCard,
  HbcButton,
  HbcSelect,
  HbcStatusBadge,
  Text,
} from '@hbc/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { FiscalYearScope } from '@hbc/models';
import { fetchEstimatingAnalytics } from '../data/estimatingQueries.js';

/**
 * EstimateAnalyticsPage — full analytics view for the Estimate Tracking Log.
 *
 * Option C decision: charts, fiscal year comparisons, win-rate breakdown.
 *
 * Sections:
 * 1. KPI strip: total submitted, win rate, total awarded value, FY comparison delta
 * 2. Monthly submission volume — bar chart (recharts BarChart)
 * 3. Win rate by estimate type — horizontal bar chart
 * 4. Win rate by lead estimator — horizontal bar chart
 * 5. Fiscal year comparison table (current vs previous)
 *
 * Implementation note: import recharts lazily to keep bundle within SPFx budget.
 * All chart components should be wrapped in React.Suspense with a spinner fallback.
 */
export function EstimateAnalyticsPage(): ReactNode {
  const navigate = useNavigate();
  const [fiscalYear, setFiscalYear] = useState('2026');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['estimating', 'analytics', fiscalYear],
    queryFn: () => fetchEstimatingAnalytics({ fiscalYearScope: FiscalYearScope.Current, fiscalYear }),
  });

  const { data: comparison } = useQuery({
    queryKey: ['estimating', 'analytics-comparison', fiscalYear],
    queryFn: () => fetchEstimatingAnalytics({ fiscalYearScope: FiscalYearScope.Previous }),
  });

  const kpis = [
    { label: 'Total Submitted', value: analytics?.totalSubmitted ?? '—' },
    { label: 'Win Rate', value: analytics?.winRatePercent != null ? `${analytics.winRatePercent.toFixed(1)}%` : '—' },
    { label: 'Total Awarded', value: analytics?.totalAwardedValue != null ? formatCurrency(analytics.totalAwardedValue) : '—' },
    { label: 'Pending', value: analytics?.totalPending ?? '—' },
  ];

  return (
    <WorkspacePageShell layout="list" title="Estimate Analytics">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <HbcButton appearance="subtle" onClick={() => navigate({ to: '/log' })}>← Back to Log</HbcButton>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Text weight="semibold">Fiscal Year</Text>
          <HbcSelect
            value={fiscalYear}
            onChange={setFiscalYear}
            options={['2026', '2025', '2024', '2023'].map((y) => ({ value: y, label: y }))}
          />
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {kpis.map((kpi) => (
          <HbcCard key={kpi.label} size="small">
            <Text size={200} style={{ display: 'block', marginBottom: 4 }}>{kpi.label}</Text>
            <Text size={700} weight="bold">{kpi.value}</Text>
          </HbcCard>
        ))}
      </div>

      {/* Monthly Volume Chart — lazy-loaded */}
      <HbcCard style={{ marginBottom: 20 }}>
        <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 12 }}>Monthly Submission Volume — FY {fiscalYear}</Text>
        {/* IMPLEMENTATION: Use recharts BarChart with two bars (submitted, awarded).
            Import: import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
            Data: analytics?.monthlyVolume ?? []
            Keys: submitted (colorBrandBackground), awarded (colorStatusSuccessBackground1) */}
        <MonthlyVolumeChart data={analytics?.monthlyVolume ?? []} isLoading={isLoading} />
      </HbcCard>

      {/* Win Rate by Estimate Type */}
      <HbcCard style={{ marginBottom: 20 }}>
        <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 12 }}>Win Rate by Estimate Type</Text>
        <EstimateTypeBreakdownChart data={analytics?.byEstimateType ?? []} isLoading={isLoading} />
      </HbcCard>

      {/* Win Rate by Estimator */}
      <HbcCard style={{ marginBottom: 20 }}>
        <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 12 }}>Win Rate by Lead Estimator</Text>
        <EstimatorBreakdownChart data={analytics?.byEstimator ?? []} isLoading={isLoading} />
      </HbcCard>

      {/* Fiscal Year Comparison */}
      {comparison && (
        <HbcCard>
          <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 12 }}>Year-over-Year Comparison</Text>
          <FiscalYearComparisonTable current={analytics} previous={comparison} />
        </HbcCard>
      )}
    </WorkspacePageShell>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

// Stub components — implement with recharts in the actual build:
function MonthlyVolumeChart({ data, isLoading }: { data: unknown[]; isLoading: boolean }): ReactNode {
  if (isLoading) return <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text>Loading…</Text></div>;
  // TODO: Replace with recharts BarChart. See implementation note above.
  return <div style={{ height: 200, background: 'var(--colorNeutralBackground2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text size={200}>Chart renders here ({data.length} months)</Text></div>;
}

function EstimateTypeBreakdownChart({ data, isLoading }: { data: unknown[]; isLoading: boolean }): ReactNode {
  if (isLoading) return null;
  return <div style={{ height: 180, background: 'var(--colorNeutralBackground2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text size={200}>Breakdown chart ({data.length} types)</Text></div>;
}

function EstimatorBreakdownChart({ data, isLoading }: { data: unknown[]; isLoading: boolean }): ReactNode {
  if (isLoading) return null;
  return <div style={{ height: 180, background: 'var(--colorNeutralBackground2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text size={200}>Estimator chart ({data.length} estimators)</Text></div>;
}

function FiscalYearComparisonTable({ current, previous }: { current: unknown; previous: unknown }): ReactNode {
  // TODO: Implement comparison table with rows: Submitted, Win Rate, Awarded Value, Not Awarded
  return <div style={{ height: 120, background: 'var(--colorNeutralBackground2)', borderRadius: 4 }} />;
}
```

---

## 7-Estimating.8 — Templates Page (Rebuilt)

Replace the existing `TemplatesPage.tsx` placeholder entirely:

```typescript
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  WorkspacePageShell,
  HbcCard,
  HbcButton,
  Text,
  HbcStatusBadge,
} from '@hbc/ui-kit';
import { useQuery } from '@tanstack/react-query';
import type { ITemplateLink } from '@hbc/models';
import { TemplateLinkCategory } from '@hbc/models';
import { fetchTemplateLinks } from '../data/estimatingQueries.js';

const CATEGORY_ORDER: TemplateLinkCategory[] = [
  TemplateLinkCategory.CoverAndSummary,
  TemplateLinkCategory.CostBreakdowns,
  TemplateLinkCategory.ClarificationsAndAllowances,
  TemplateLinkCategory.ScheduleAndLogistics,
  TemplateLinkCategory.BimAndTechnology,
  TemplateLinkCategory.TeamAndExperience,
  TemplateLinkCategory.LegalAndFinancial,
  TemplateLinkCategory.Other,
];

const FILE_TYPE_ICON: Record<string, string> = {
  docx: '📝', xlsx: '📊', pdf: '📄', pptx: '📋', default: '📁',
};

/**
 * TemplatesPage — curated SharePoint link library for proposal deliverables.
 *
 * Option B decision: no file storage in HB Intel. Templates live in SharePoint.
 * This page is an organized, searchable launchpad to those files.
 *
 * Categories match the standard proposal deliverable sections from the
 * Estimating Kickoff document (Standard + Non-Standard sections).
 */
export function TemplatesPage(): ReactNode {
  const [search, setSearch] = useState('');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['estimating', 'templates'],
    queryFn: fetchTemplateLinks,
  });

  const filtered = search
    ? templates.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      )
    : templates;

  const byCategory = CATEGORY_ORDER.reduce<Record<string, ITemplateLink[]>>((acc, cat) => {
    const items = filtered.filter((t) => t.category === cat && t.isActive);
    if (items.length > 0) acc[cat] = items.sort((a, b) => a.sortOrder - b.sortOrder);
    return acc;
  }, {});

  return (
    <WorkspacePageShell layout="list" title="Proposal Templates">
      <div style={{ marginBottom: 20, maxWidth: 400 }}>
        <input
          type="search"
          placeholder="Search templates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid var(--colorNeutralStroke1)',
            borderRadius: 4,
            fontSize: 14,
          }}
        />
      </div>

      {isLoading && <Text>Loading templates…</Text>}

      {Object.entries(byCategory).map(([category, items]) => (
        <div key={category} style={{ marginBottom: 28 }}>
          <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 12 }}>
            {category}
          </Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {items.map((template) => (
              <HbcCard key={template.id} size="small" style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>
                  {FILE_TYPE_ICON[template.fileType] ?? FILE_TYPE_ICON.default}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text size={300} weight="semibold" style={{ display: 'block', marginBottom: 2 }}>
                    {template.title}
                  </Text>
                  {template.description && (
                    <Text size={200} style={{ color: 'var(--colorNeutralForeground3)', display: 'block', marginBottom: 6 }}>
                      {template.description}
                    </Text>
                  )}
                  <HbcButton
                    size="small"
                    appearance="outline"
                    onClick={() => window.open(template.sharePointUrl, '_blank', 'noopener noreferrer')}
                  >
                    Open in SharePoint
                  </HbcButton>
                </div>
              </HbcCard>
            ))}
          </div>
        </div>
      ))}

      {!isLoading && Object.keys(byCategory).length === 0 && (
        <Text style={{ color: 'var(--colorNeutralForeground3)' }}>
          {search ? `No templates match "${search}".` : 'No templates configured. Contact your Admin to add template links.'}
        </Text>
      )}
    </WorkspacePageShell>
  );
}
```

---

## 7-Estimating.9 — Cross-Module: Project Hub Kickoff Link Integration

This section documents the cross-module contract between Estimating and Project Hub.

### Navigation Contract

When a user clicks a pursuit row in `ActivePursuitsPage`, the app navigates to:
```
/project-hub/{projectNumber}/kickoff
```

This route is owned by the **Project Hub** app (`apps/project-hub`). It must be implemented as part of the Project Hub module build. The Estimating module is responsible only for triggering the navigation.

### Implementation Note in `ActivePursuitsPage`

The `handleRowClick` function in `7-Estimating.4` performs this navigation using TanStack Router's `navigate()`:

```typescript
navigate({ to: `/project-hub/${pursuit.projectNumber}/kickoff` });
```

### Required Project Hub Route (deferred — implement in Project Hub module)

The following route must be registered in `apps/project-hub/src/router/routes.ts` during the Project Hub module build:

```typescript
// Deferred to Project Hub module interview and build.
// Route: /project-hub/:projectId/kickoff
// Page: KickoffPage — the responsibility matrix and deliverable checklist
//       derived from the Estimating Kickoff spreadsheet structure.
// Accessible from: (1) Project Hub directly, (2) redirect from Estimating pursuits table.
```

### Data Requirement

The Project Hub kickoff record must store a `projectNumber` field that matches the `IActivePursuit.projectNumber` field to support bidirectional linking.

---

## 7-Estimating.10 — External Platform Deep Links

Deep link fields (`buildingConnectedUrl`, `procoreUrl`) are stored on the `IActivePursuit` model and displayed via the `ExternalPlatformLinks` component (implemented in `7-Estimating.4.2`). No additional implementation is required beyond what is defined in `7-Estimating.4`.

### Admin Management of Template Links

Template links (`ITemplateLink`) are managed by Admins via a new tab in Admin → System Settings. Add the following to `7-Admin.10` (System Settings expansion):

- Add a "Template Library" tab to `SystemSettingsPage.tsx`
- CRUD operations for `ITemplateLink` records
- Fields: Title, Category (dropdown), SharePoint URL, File Type, Description, Sort Order, Active toggle
- This surfaces in the Estimating → Templates page automatically

---

## 7-Estimating.11 — Backend API Endpoints

Add to `backend/functions/src/functions/estimating/index.ts`:

```typescript
// All endpoints require Bearer token validation.
// All write endpoints require role: 'Estimating' or 'Admin'.

// ─── Active Pursuits ──────────────────────────────────────────────────────────
// GET    /api/estimating/pursuits              → list all active pursuits
// POST   /api/estimating/pursuits              → create a new pursuit
// PATCH  /api/estimating/pursuits/:id          → update a pursuit (partial)
// DELETE /api/estimating/pursuits/:id          → delete a pursuit

// ─── Active Preconstruction ───────────────────────────────────────────────────
// GET    /api/estimating/preconstruction        → list all precon records
// POST   /api/estimating/preconstruction        → create a precon record
// PATCH  /api/estimating/preconstruction/:id    → update a precon record
// DELETE /api/estimating/preconstruction/:id    → delete a precon record

// ─── Estimate Tracking Log ────────────────────────────────────────────────────
// GET    /api/estimating/log?fiscalYear=2025    → list log entries (required: fiscalYear)
// POST   /api/estimating/log                   → create a log entry
// PATCH  /api/estimating/log/:id               → update a log entry

// ─── Analytics ───────────────────────────────────────────────────────────────
// GET    /api/estimating/analytics?fiscalYear=2025  → computed analytics for a FY
// GET    /api/estimating/analytics/comparison        → current vs previous FY

// ─── Templates ───────────────────────────────────────────────────────────────
// GET    /api/estimating/templates              → list all active template links
// POST   /api/estimating/templates              → create a template link (Admin only)
// PATCH  /api/estimating/templates/:id          → update a template link (Admin only)
// DELETE /api/estimating/templates/:id          → delete a template link (Admin only)

// ─── Home Summary ─────────────────────────────────────────────────────────────
// GET    /api/estimating/summary               → aggregated home page stats
```

---

## 7-Estimating.12 — SharePoint List Schemas

Create the following SharePoint lists via the provisioning saga or admin setup scripts.

### `HBIntelActivePursuits`

| Column | Type | Required | Notes |
|---|---|---|---|
| ProjectNumber | Single line of text | Yes | Format: ##-###-## |
| ProjectName | Single line of text | Yes | |
| Source | Single line of text | No | |
| Deliverable | Choice | No | Lump Sum, GMP, Hard Bid, etc. |
| SubBidsDue | Date | No | |
| PresubmissionReview | Date | No | |
| WinStrategyMeeting | Date | No | |
| DueDate | Date | Yes | |
| LeadEstimatorUpn | Single line of text | Yes | Azure AD UPN |
| LeadEstimatorName | Single line of text | Yes | |
| ContributorUpns | Multi-line text | No | JSON array |
| ContributorNames | Multi-line text | No | JSON array |
| ProjectExecutiveUpn | Single line of text | No | |
| ProjectExecutiveName | Single line of text | No | |
| Status | Choice | Yes | Active, Submitted, Awarded, NotAwarded, OnHold, Withdrawn |
| CheckBidBond | Yes/No | No | |
| CheckPPBond | Yes/No | No | |
| CheckSchedule | Yes/No | No | |
| CheckLogistics | Yes/No | No | |
| CheckBimProposal | Yes/No | No | |
| CheckPreconProposal | Yes/No | No | |
| CheckProposalTabs | Yes/No | No | |
| CheckMarketingCoordination | Yes/No | No | |
| CheckBusinessTerms | Yes/No | No | |
| BuildingConnectedUrl | Single line of text | No | |
| ProcoreUrl | Single line of text | No | |
| UpdatedByUpn | Single line of text | Yes | |

### `HBIntelActivePreconstruction`

| Column | Type | Required | Notes |
|---|---|---|---|
| ProjectNumber | Single line of text | Yes | |
| ProjectName | Single line of text | Yes | |
| CurrentStage | Choice | Yes | Schematic, DD, 50% CD, GMP, Closed, On Hold |
| PreconBudget | Currency | No | |
| DesignBudget | Currency | No | |
| BilledToDate | Currency | No | |
| LeadEstimatorUpn | Single line of text | Yes | |
| LeadEstimatorName | Single line of text | Yes | |
| ProjectExecutiveUpn | Single line of text | No | |
| ProjectExecutiveName | Single line of text | No | |
| Notes | Multi-line text | No | |
| UpdatedByUpn | Single line of text | Yes | |

### `HBIntelEstimateLog`

| Column | Type | Required | Notes |
|---|---|---|---|
| ProjectNumber | Single line of text | Yes | |
| ProjectName | Single line of text | Yes | |
| EstimateType | Choice | Yes | Conceptual Estimate, Lump Sum Proposal, GMP Est, ROM, Hard Bid, SD Estimate, Design Build, Schematic Estimate |
| FiscalYear | Single line of text | Yes | Format: YYYY |
| CostPerGsf | Number | No | |
| CostPerUnit | Currency | No | |
| SubmittedDate | Date | Yes | |
| Outcome | Choice | Yes | Pending, Awarded W Precon, Awarded W/O Precon, Not Awarded |
| AmountPending | Currency | No | |
| AmountAwardedWithoutPrecon | Currency | No | |
| AmountNotAwarded | Currency | No | |
| AmountAwardedWithPrecon | Currency | No | |
| LeadEstimatorUpn | Single line of text | Yes | |
| LeadEstimatorName | Single line of text | Yes | |
| Notes | Multi-line text | No | |

### `HBIntelTemplateLinks`

| Column | Type | Required | Notes |
|---|---|---|---|
| Title | Single line of text | Yes | Display name |
| Category | Choice | Yes | Matches TemplateLinkCategory enum |
| SharePointUrl | Single line of text | Yes | Full URL |
| FileType | Single line of text | Yes | docx, xlsx, pdf, pptx |
| Description | Multi-line text | No | |
| SortOrder | Number | Yes | Default: 0 |
| IsActive | Yes/No | Yes | Default: true |
| UpdatedByUpn | Single line of text | Yes | |

---

## 7-Estimating.13 — Testing

### Unit Tests (Vitest)

Create `apps/estimating/src/__tests__/` with the following test files:

**`pursuits.test.ts`**
- `PursuitChecklistInline` renders correct count badge (5/9, 9/9, 0/9)
- `PursuitChecklistInline` applies correct variant (success at 9/9, warning at 7–8/9, neutral below)
- `ExternalPlatformLinks` renders BC button when `buildingConnectedUrl` present
- `ExternalPlatformLinks` renders Procore button when `procoreUrl` present
- `ExternalPlatformLinks` renders nothing when both URLs absent

**`analytics.test.ts`**
- `formatCurrency` formats $0 → "$0", $450000 → "$450K", $1200000 → "$1.2M"
- Win rate computation: 3 awarded / (3 awarded + 7 not awarded) = 30%
- `OUTCOME_VARIANT` maps all four outcomes to correct badge variants

**`templates.test.ts`**
- `TemplatesPage` filters templates by search string (title and description)
- `TemplatesPage` groups templates by category in correct order
- `TemplatesPage` hides inactive templates

**`routes.test.ts`**
- All 7 routes resolve to correct page components
- `/log/analytics` renders `EstimateAnalyticsPage`

### E2E Tests (Playwright)

Create `apps/estimating/e2e/` with:

**`estimating-home.spec.ts`**
- Renders summary stat cards
- Navigation tiles link to correct routes
- Urgent pursuits banner appears when due date within 7 days

**`pursuits.spec.ts`**
- Pursuits table renders with correct columns
- Add pursuit modal opens and closes
- Edit pursuit pre-populates form correctly
- Delete confirm dialog fires on Delete button click
- Row click triggers navigation to project-hub kickoff path
- BC/Procore buttons open external URLs without propagating row click
- Checklist badge shows correct fraction

**`preconstruction.spec.ts`**
- Preconstruction table renders with stage badge
- Currency columns format correctly ($1.2M / $450K)
- Add / edit / delete CRUD flows complete successfully

**`log-analytics.spec.ts`**
- Log table filters by fiscal year
- "View Analytics" button navigates to `/log/analytics`
- Analytics page renders KPI strip
- Back button returns to log

**`templates.spec.ts`**
- Templates page renders by category
- Search filters results correctly
- "Open in SharePoint" button triggers external navigation

---

## 7-Estimating.14 — Documentation & ADR

### How-To Guide

Create `docs/how-to/developer/phase-7-estimating-guide.md` covering:
- Overview of the five page components and their routing
- How to add a new column to the Pursuits table
- How to add a new template link category
- How to extend the analytics endpoint with a new breakdown dimension
- Cross-module navigation contract with Project Hub
- How to update SharePoint list schemas when model fields change

### ADR

Create `docs/architecture/adr/ADR-0075-estimating-module-decisions.md`:

```markdown
# ADR-0075 — Estimating Module Design Decisions

**Date:** 2026-03-07
**Status:** Accepted
**Deciders:** Product Owner (Bobby Fetting), Implementation Agent

## Context
Structured product-owner interview conducted 2026-03-07 to lock all Estimating module design decisions before implementation.

## Decisions

### 1. All Three Tracking Tables in Estimating (Q11)
Resolved that Current Pursuits, Current Preconstruction, and Estimate Tracking Log all live permanently in the Estimating module. The Project Hub is limited to single-project context only — multi-project tracking tables are explicitly excluded.

### 2. Kickoff / Submission Checklist in Project Hub (Q12)
The Estimating Kickoff responsibility matrix and deliverable checklist live in the Project Hub at `/project-hub/:projectId/kickoff`. The Estimating pursuits table provides a redirect link on row click. This follows the single-project-context rule.

### 3. Templates as Curated SharePoint Link Library (Q13 — Option B)
HB Intel does not store template files. The Templates page is a curated, categorized list of links to SharePoint-hosted files organized by proposal deliverable section.

<!-- FUTURE OPTION C:
  HB Intel manages template files directly with versioning and upload controls.
  Requires: file storage adapter in @hbc/data-access, admin file management UI,
  version history API. Revisit when SharePoint link maintenance becomes a pain point.
-->

### 4. Estimate Tracking Log — Full Analytics (Q14 — Option C)
The Estimate Tracking Log has a dedicated analytics view at `/log/analytics` with:
- Monthly submission volume bar chart
- Win rate by estimate type
- Win rate by lead estimator
- Fiscal year comparison (current vs. previous)
- Live KPI strip (total submitted, win rate, awarded value, pending count)

Note: Company-wide, cross-module analytics (e.g., BD win rate correlated with estimating volume) are deferred to the Leadership module.

### 5. External Platforms — Contextual Deep Links (Q15 — Option B)
Building Connected and Procore URLs are stored per-pursuit record and surfaced as "BC" and "PC" link buttons in the pursuits table. No API integration.

<!-- FUTURE OPTION C:
  Live data integration with Building Connected API (sub bid response rates)
  and Procore API (open RFI counts). Requires:
  - BC API credentials stored in Admin → System Settings
  - Procore OAuth flow per user
  - @hbc/data-access BC and Procore adapters
  - Rate limit handling and error resilience
  Estimated effort: 2–3 sprints. Revisit when team size and API stability justify it.
-->

## Governing Architectural Rule
> "The Project Hub will contain features that use data for one unique project at a time.
> Tracking that includes multiple projects will never be included in the Project Hub."
> — Product Owner, 2026-03-07

This rule governs all future cross-module placement decisions.
```

---

## Verification Commands

After completing all tasks, run:

```bash
# 1. Build all packages
pnpm turbo run build

# 2. Type-check the estimating app
pnpm --filter @hbc/estimating tsc --noEmit

# 3. Run unit tests
pnpm --filter @hbc/estimating vitest run

# 4. Confirm docs exist
ls docs/how-to/developer/phase-7-estimating-guide.md
ls docs/architecture/adr/ADR-0075-estimating-module-decisions.md

# 5. Confirm all 7 routes are registered
grep -n "Route\|path:" apps/estimating/src/router/routes.ts
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 7-Estimating plan created: 2026-03-07
Source: Structured product-owner interview (2026-03-07), Q11–Q15 all locked.
Spreadsheet analysis: ESTIMATING Tracking Spreadsheet 2025.xlsx (3 tables confirmed).
Kickoff analysis: Estimating Kickoff - Ocean Towers 07.21.25.xlsx (responsibility matrix confirmed).
Documentation to add: docs/how-to/developer/phase-7-estimating-guide.md
ADR to create: docs/architecture/adr/ADR-0075-estimating-module-decisions.md
Next: Continue interview — Accounting module (Q16 onward).
-->
