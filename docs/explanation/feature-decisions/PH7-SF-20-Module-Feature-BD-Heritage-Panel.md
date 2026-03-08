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

**The BD Heritage Panel** solves Problem 1 by surfacing BD context on every project record view — making BD intelligence visible to the project team throughout delivery.

**Living Strategic Intelligence** solves Problem 2 by creating a continuously enriched knowledge base: team members can contribute observations, client preferences, market intelligence, and competitor intel throughout the project lifecycle — not just at pursuit time. This intelligence is visible to future BD efforts on similar clients or project types.

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #3 (Unified Work Graph) specifies: "The relationship between a project and its BD origin is always visible, always current, and always actionable." The con-tech UX study §4 documents that BD-to-delivery context loss is universal — every platform treats BD and delivery as separate systems with no knowledge transfer.

Living Strategic Intelligence extends this with Operating Principle §7.2 (Responsibility-first): every intelligence contribution has an author, a timestamp, an approval status, and a responsible approver — making it a structured, governed knowledge asset rather than a shared comment thread.

---

## Feature 1: BD Heritage Panel

### What It Shows

The BD Heritage Panel is a read-only panel rendered in:
1. **Project Hub project records** — full BD heritage context from originating scorecard
2. **Estimating Active Pursuit records** — BD heritage from the Go/No-Go phase

```typescript
// BD Heritage Panel data model
export interface IBdHeritageData {
  /** Source BD Scorecard */
  scorecardId: string;
  scorecardVersion: number; // version at handoff moment
  projectName: string;
  ownerName: string;
  ownerContactName: string;
  ownerContactRole: string;
  /** Go/No-Go decision and rationale */
  decision: 'GO' | 'NO-GO' | 'WAIT';
  decisionRationale: string;
  /** Key strategic context captured during BD */
  clientPriorities: string[];
  competitiveContext: string;
  keyRelationships: string;
  estimatedValue: number;
  projectType: string;
  /** Linked Living Strategic Intelligence entries */
  intelligenceEntries: IStrategicIntelligenceEntry[];
  /** BD team members who worked the pursuit */
  bdTeam: IBicOwner[];
  handoffDate: string;
}
```

### BD Heritage Panel UI

```typescript
// Component in Project Hub and Estimating modules
interface BdHeritagePanelProps {
  projectId: string; // or pursuitsId
  heritageData: IBdHeritageData;
}
```

**Visual behavior:**
- Collapsible sidebar panel titled "BD Heritage"
- Header: client name, decision badge (GO/NO-GO/WAIT), handoff date
- Section: **Strategic Context** — client priorities, competitive context, key relationships
- Section: **BD Team** — avatars of BD team members with "Contact" links
- Section: **Living Strategic Intelligence** — latest intelligence entries (see Feature 2)
- Link: "View Full BD Scorecard (v{N})" → navigates to the versioned scorecard snapshot
- Lock icon: "Read-only — BD heritage is the record at handoff" (cannot be edited from this panel)

---

## Feature 2: Living Strategic Intelligence

### What It Is

A continuously enriched, governed knowledge base attached to each client/project combination. Anyone with project permissions can contribute an intelligence entry; the entry is reviewed and approved by the configured approver (Director of Preconstruction or Chief Estimator, per Admin approval authority config from SF-17).

### Intelligence Entry Types

| Type | Description | Example |
|---|---|---|
| Client Preference | Observed client preferences or requirements | "Client strongly prefers weekly written progress updates" |
| Competitor Intel | Observed competitor activity or strategy | "Acme Construction bidding aggressively below cost in this geography" |
| Market Condition | Regional market observation | "Electrical sub shortage in this metro; bid early" |
| Relationship Note | Key relationship context | "Owner's rep is a former HB employee — strong rapport" |
| Risk Observation | Strategic risk for future pursuits | "Client changes scope late in construction — price risk" |
| Win/Loss Factor | Retrospective factor in this project's outcome | "Won on schedule commitment, not price" |

### Intelligence Entry Lifecycle

```
Contributor submits entry (anyone with project permissions)
    → Entry in 'pending-approval' status
    → Approver notified (Immediate notification via @hbc/notification-intelligence)
    → Approver reviews: Approve OR Reject with reason
    → Approved: entry visible in BD Heritage Panel + searchable
    → Rejected: contributor notified with reason; can revise and resubmit
```

```typescript
export interface IStrategicIntelligenceEntry {
  entryId: string;
  type: IntelligenceEntryType;
  title: string;
  body: string;
  tags: string[];
  /** Associated project/client context */
  projectId: string;
  clientName: string;
  /** Contributor */
  contributor: IBicOwner;
  submittedAt: string;
  /** Approval */
  approvalStatus: 'pending-approval' | 'approved' | 'rejected';
  approver: IBicOwner | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  /** Version (each revision creates a new version) */
  version: number;
  /** Cross-reference: related BD scorecard, if applicable */
  relatedScorecardId?: string;
}
```

---

## Component Architecture

```
apps/business-development/src/features/strategic-intelligence/
├── BdHeritagePanel.tsx             # read-only heritage panel (BD, Project Hub, Estimating)
├── StrategicIntelligenceFeed.tsx   # approved entries feed for a project
├── IntelligenceEntryForm.tsx       # new entry submission form
├── IntelligenceApprovalQueue.tsx   # approver view: pending entries for review
├── useStrategicIntelligence.ts     # loads entries, submits, approves
└── types.ts
```

---

## Contributor Permission Model

Per the Q13 interview decision: **anyone with permissions for the specific project** can contribute a strategic intelligence entry. This means:
- Project Manager, Superintendent, PE, Estimator, BD Manager — anyone on the project team can submit an entry
- The entry enters a pending-approval queue before becoming part of the official knowledge base
- Approval authority is configured in the Admin module (SF-17): Director of Preconstruction OR Chief Estimator

This democratizes intelligence collection while maintaining governance over what enters the canonical knowledge base.

---

## Cross-Module Surface Points

| Module | Surface | Content |
|---|---|---|
| Business Development | Scorecard detail view | Full intelligence feed for this client |
| Estimating | Active Pursuit sidebar | BD Heritage panel + recent intelligence entries |
| Project Hub | Project record sidebar | BD Heritage panel + all intelligence entries |
| `@hbc/project-canvas` | BD Heritage Canvas Tile | Summary of latest approved intelligence entries |
| `@hbc/search` | Indexed | Intelligence entry body + tags searchable cross-module |

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/versioned-record` | Intelligence entries are versioned; approved entries create `'approved'` version snapshots |
| `@hbc/acknowledgment` | Approval flow uses `@hbc/acknowledgment` single-party pattern with Admin-configured approvers |
| `@hbc/sharepoint-docs` | Intelligence entries may include supporting document attachments |
| `@hbc/notification-intelligence` | New entry pending approval → Immediate notification to approver; approval/rejection → Watch to contributor |
| `@hbc/search` | Approved intelligence entries indexed and searchable by client, project type, tags, body text |
| `@hbc/complexity` | Essential: Heritage panel collapsed; Standard: Heritage panel visible; Expert: Full intelligence feed with all entries and approval history |
| PH7-SF-19 Score Benchmark | Intelligence entries contribute market context to benchmark data analysis |
| PH7-SF-22 Post-Bid Learning Loop | Win/Loss Factor entries are seeded from completed post-bid autopsies |

---

## Priority & ROI

**Priority:** P1 — Solves a pervasive pain point (BD context loss at handoff) and creates the first continuously enriched project intelligence system in construction management
**Estimated build effort:** 5–6 sprint-weeks (BD heritage panel, intelligence feed, entry form, approval queue, cross-module surfaces)
**ROI:** Eliminates BD knowledge loss at project handoff; creates compounding intelligence value over time (each project enriches future BD decisions); democratizes contribution while maintaining governance; surfaces the organizational knowledge currently trapped in individuals' email inboxes

---

## Definition of Done

**BD Heritage Panel:**
- [ ] `IBdHeritageData` type defined; sourced from handoff snapshot (`@hbc/workflow-handoff`)
- [ ] `BdHeritagePanel` renders in Project Hub project records
- [ ] `BdHeritagePanel` renders in Estimating Active Pursuit records
- [ ] Link to versioned BD scorecard snapshot functional
- [ ] `@hbc/project-canvas` BD Heritage tile implemented

**Living Strategic Intelligence:**
- [ ] `IStrategicIntelligenceEntry` type defined with all entry types
- [ ] `IntelligenceEntryForm` allows any project-permissioned user to submit entries
- [ ] Approval workflow uses `@hbc/acknowledgment` + Admin-configured approver (SF-17)
- [ ] `StrategicIntelligenceFeed` renders approved entries with type badges and contributor info
- [ ] `IntelligenceApprovalQueue` allows approvers to review, approve, or reject pending entries
- [ ] Supporting document attachments via `@hbc/sharepoint-docs`
- [ ] `@hbc/versioned-record` integration: approved entries versioned
- [ ] `@hbc/search` integration: approved entries indexed and searchable
- [ ] Notification integration: pending approval → Immediate; decision → Watch
- [ ] `@hbc/complexity` integration: all three tiers
- [ ] Unit tests on approval state machine and contributor permission checks
- [ ] E2E test: contributor submits entry → approver receives notification → approves → entry visible in BD Heritage panel

---

## ADR Reference

Create `docs/architecture/adr/0029-bd-heritage-living-strategic-intelligence.md` documenting the BD Heritage Panel data sourcing strategy (from handoff snapshot), the Living Strategic Intelligence contributor permission model (anyone with project permissions), the approval authority configuration approach (Admin-configurable), and the cross-module surface strategy.
