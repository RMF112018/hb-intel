# PH7-SF-20: BD Heritage Panel & Living Strategic Intelligence — Cross-Module Project Context

**Priority Tier:** 2 — Application Layer (BD and cross-module differentiator)
**Module:** Business Development (with cross-module surface in Project Hub + Estimating)
**Interview Decision:** Q11 (Option B — BD Heritage Panel with cross-module context) + Q12/Q13 (approval role config + contributor permissions for Living Strategic Intelligence)
**Mold Breaker Source:** UX-MB §3 (Unified Work Graph); ux-mold-breaker.md Signature Solution #3; con-tech-ux-study §4 (BD context loss post-handoff)

---

## Problem Solved

When a BD lead converts to a project, the BD team's institutional knowledge — why they pursued the client, what competitive pressures existed, what relationship history predates the project, what the client's strategic priorities are — is trapped in the BD module and invisible to the Project team. Project Managers who won the work often don't know why it was pursued, what was promised during business development, or what strategic commitments were made.

This creates two compounding problems:
1. **Context loss at handoff**: The PM starts a project with no historical context
2. **Dead-end BD knowledge**: BD intelligence becomes stale and project-specific; it is never used for the next similar pursuit

**The BD Heritage Panel** solves Problem 1 by surfacing BD context on every project record view — making BD intelligence visible to the project team throughout delivery. Every strategic gap, client-preference risk, or heritage-derived insight is automatically surfaced as a granular BIC record in `@hbc/bic-next-move` (blockers first), with ownership avatars appearing directly in the panel and in the `@hbc/project-canvas` "My Work" lane.

**Living Strategic Intelligence** solves Problem 2 by creating a continuously enriched knowledge base: team members can contribute observations, client preferences, market intelligence, and competitor intel throughout the project lifecycle — not just at pursuit time. This intelligence is visible to future BD efforts on similar clients or project types.

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #3 (Unified Work Graph) specifies: "The relationship between a project and its BD origin is always visible, always current, and always actionable." The con-tech UX study §4 documents that BD-to-delivery context loss is universal — every platform treats BD and delivery as separate systems with no knowledge transfer.

Living Strategic Intelligence extends this with Operating Principle §7.2 (Responsibility-first): every intelligence contribution has an author, a timestamp, an approval status, and a responsible approver — making it a structured, governed knowledge asset rather than a shared comment thread. The feature is the foundation of the new reusable Tier-1 `@hbc/strategic-intelligence` primitive.

---

## Data Model

```typescript
// In @hbc/strategic-intelligence primitive (new Tier-1 package)

export interface IBdHeritageData {
  scorecardId: string;
  scorecardVersion: number;
  projectName: string;
  ownerName: string;
  ownerContactName: string;
  ownerContactRole: string;
  decision: 'GO' | 'NO-GO' | 'WAIT';
  decisionRationale: string;
  clientPriorities: string[];
  competitiveContext: string;
  keyRelationships: string;
  estimatedValue: number;
  projectType: string;
  intelligenceEntries: IStrategicIntelligenceEntry[];
  bdTeam: IBicOwner[];
  handoffDate: string;
  version: VersionedRecord; // from @hbc/versioned-record
  telemetry: IStrategicIntelligenceTelemetryState;
}

export interface IStrategicIntelligenceEntry {
  entryId: string;
  type: IntelligenceEntryType;
  title: string;
  body: string;
  tags: string[];
  projectId: string;
  clientName: string;
  contributor: IBicOwner;
  submittedAt: string;
  approvalStatus: 'pending-approval' | 'approved' | 'rejected';
  approver: IBicOwner | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  version: number;
  relatedScorecardId?: string;
  bicRecordId?: string; // link to @hbc/bic-next-move for risk/gap entries
}

export interface IStrategicIntelligenceTelemetryState {
  timeToHandoffContextReviewMs: number | null;
  intelligenceContributionLatencyMs: number | null;
  pctHeritagePanelsViewed: number | null;
  heritageReuseRate: number | null;
  strategicIntelligenceCes: number | null;
}
```

**Model behavior notes:**
- `IBdHeritageData` is immutable at handoff snapshot time, with controlled additive intelligence updates over time
- `IStrategicIntelligenceEntry` supports revisioned resubmission after rejection without mutating prior approved versions
- `bicRecordId` is required for entries classified as strategic gap/risk that require accountable closure
- KPI telemetry is emitted by primitive hooks and consumed by both canvas and governance dashboards

---

## Component Architecture

```
apps/business-development/src/features/strategic-intelligence/
├── useStrategicIntelligence.ts     # now delegates to @hbc/strategic-intelligence
├── BdHeritagePanel.tsx             # read-only heritage panel
├── StrategicIntelligenceFeed.tsx   # approved entries feed
├── IntelligenceEntryForm.tsx       # new entry submission form
├── IntelligenceApprovalQueue.tsx   # approver view
└── types.ts
```

(The entire model, offline logic, AI actions, gap BIC ownership, and telemetry are now provided by the new `@hbc/strategic-intelligence` primitive.)

**Cross-module surface points:**

| Module | Surface | Content |
|---|---|---|
| Business Development | Scorecard detail view | Full intelligence feed for this client |
| Estimating | Active Pursuit sidebar | BD Heritage panel + recent intelligence entries |
| Project Hub | Project record sidebar | BD Heritage panel + all intelligence entries |
| `@hbc/project-canvas` | Strategic Intelligence tile | Summary of latest approved entries + open gaps |
| `@hbc/search` | Indexed | Approved entry title/body/tags searchable cross-module |

---

## Component Specifications

**BD Heritage Panel & Intelligence Feed (Complexity-aware):**
- Essential: collapsed `BD Heritage & Intelligence` badge only
- Standard: read-only Heritage Panel + approved intelligence feed (simplified contribution button)
- Expert: full entry form, approval queue, and `Configure approvers` link

**Approval and contribution behavior:**
- Anyone with permissions for the specific project can submit entries
- Entries route to approver queue based on SF-17 admin-configured approval authority
- Approved entries project deep-links and ownership into panel/feed/canvas contexts

**BIC ownership behavior:**
- Risk/gap entries auto-create or link granular BIC records in `@hbc/bic-next-move`
- Panel/feed rows show owning avatar and status hints
- My Work lane receives automatic role-aware assignment cards via `@hbc/project-canvas`

**Inline AI actions** appear in the entry form and feed (Standard/Expert only).

**Intelligence entry types:**

| Type | Description | Example |
|---|---|---|
| Client Preference | Observed client preferences or requirements | `Client strongly prefers weekly written progress updates` |
| Competitor Intel | Observed competitor activity or strategy | `Regional competitor bidding aggressively below cost` |
| Market Condition | Regional market observation | `Electrical sub shortage in this metro; bid early` |
| Relationship Note | Key relationship context | `Owner rep has strong prior HB relationship` |
| Risk Observation | Strategic risk for future pursuits | `Client changes scope late in construction` |
| Win/Loss Factor | Retrospective factor in project outcome | `Won on schedule commitment, not price` |

**Approval lifecycle:**
1. Contributor submits entry from panel/feed/form context
2. Entry status becomes `pending-approval`
3. Configured approver receives immediate notification
4. Approver approves or rejects with reason
5. Approved entries become searchable and reusable in future pursuits

---

## AI Action Layer Integration

AI suggestions (`Draft from daily logs`, `Summarize heritage for new pursuit`, `Suggest risk tags`) appear as contextual inline buttons and smart placeholders in form/feed/panel surfaces. Suggestions cite sources, require explicit approval, auto-populate entries, and integrate natively with `@hbc/versioned-record` and `@hbc/bic-next-move`. No separate chat interface.

AI outputs remain proposal-state until user approval commits the change. Approved AI actions retain provenance links to source entries, generated suggestions, and resulting BIC records to preserve implementation-truth traceability.

---

## Integration Points (All Tier-1 Primitives)

| Package | Integration |
|---|---|
| `@hbc/strategic-intelligence` | New Tier-1 primitive providing the entire model |
| `@hbc/bic-next-move` | Granular BIC ownership for risk/gap entries with avatar projection |
| `@hbc/complexity` | Essential/Standard/Expert progressive disclosure |
| `@hbc/versioned-record` | Immutable provenance, audit trail, snapshot freezing |
| `@hbc/related-items` | Direct deep-links from every intelligence entry/gap |
| `@hbc/project-canvas` | Automatic placement in role-aware My Work lane |
| `@hbc/acknowledgment` | Approval flow |
| `@hbc/notification-intelligence` | Pending approval & decision notifications |
| `@hbc/strategic-intelligence` telemetry | Five KPIs (time-to-handoff-context-review, intelligence-contribution latency, % heritage panels viewed, heritage-reuse rate, strategic-intelligence CES) surfaced in canvas and admin dashboard |

---

## Offline / PWA Resilience

Full tablet-native behavior: service worker caches the Heritage Panel, feed, form, and queue; IndexedDB + `@hbc/versioned-record` persists drafts and state; Background Sync replays changes with optimistic UI and `Saved locally / Queued to sync` indicators. Works identically to Punch List, RFI drafts, Bid Readiness Signal, and Score Benchmark gaps.

Offline state guarantees:
- Read paths resolve from cached heritage snapshots when network is unavailable
- Draft submissions persist locally without blocking panel/feed navigation
- Approval actions queue locally for authorized approvers and replay in-order on reconnect
- Conflict resolution preserves immutable version history rather than overwriting accepted records

---

## Priority & ROI

**Priority:** P1 — Solves a pervasive pain point and creates the first continuously enriched project intelligence system in construction management; seed for the platform-wide `@hbc/strategic-intelligence` primitive.
**Estimated build effort:** 5–6 sprint-weeks (now accelerated by reusing existing primitives).
**ROI:** Eliminates BD knowledge loss; creates compounding intelligence value; measurable impact via UX telemetry.
**Operational value:** Makes handoff context review and strategic insight reuse visible, measurable, and accountable across BD, Estimating, and Project Hub.
**KPI tracking expectations:**
- time-to-handoff-context-review
- intelligence-contribution latency
- % heritage panels viewed
- heritage-reuse rate
- strategic-intelligence CES
- Metrics are role-aware and complexity-aware in canvas/admin surfaces.

---

## Definition of Done

- [ ] New `@hbc/strategic-intelligence` Tier-1 primitive created and published
- [ ] All six locked integration patterns implemented and tested
- [ ] Offline/PWA resilience verified on tablet
- [ ] Embedded AI actions with provenance and approval guardrails
- [ ] Progressive disclosure via `@hbc/complexity` across all three modes
- [ ] Deep-links and canvas integration via `@hbc/related-items` and `@hbc/project-canvas`
- [ ] Versioned audit trail and admin governance via `@hbc/versioned-record`
- [ ] Five UX telemetry KPIs wired and surfaced
- [ ] Unit tests, Storybook stories for all modes and offline states
- [ ] ADR-0105-strategic-intelligence-primitive created

---

## ADR Reference

Create `docs/architecture/adr/0105-bd-heritage-living-strategic-intelligence.md` (and companion ADR for the new `@hbc/strategic-intelligence` primitive) documenting the BD Heritage Panel data sourcing strategy, the Living Strategic Intelligence contributor permission model, the approval authority configuration approach, granular BIC integration for gaps, complexity-adaptive disclosure, offline strategy, AI Action Layer embedding, cross-module deep-linking, versioning/governance, and telemetry KPIs.

---
