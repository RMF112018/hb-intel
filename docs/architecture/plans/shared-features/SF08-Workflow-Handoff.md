# SF08 — `@hbc/workflow-handoff`: Structured Cross-Module Workflow Handoff

**Plan Version:** 1.0
**Date:** 2026-03-09
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-08-Shared-Feature-Workflow-Handoff.md`
**Priority Tier:** 1 — Foundation (must exist before any cross-module transition is implemented)
**Estimated Effort:** 5–6 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0092-workflow-handoff-platform-primitive.md`

> **Doc Classification:** Canonical Normative Plan — SF08 implementation master plan for `@hbc/workflow-handoff`; governs all task files SF08-T01 through SF08-T09.

---

## Purpose

`@hbc/workflow-handoff` makes the most critical transitions in construction project delivery — BD lead to Estimating pursuit, Estimating pursuit to Project Hub project, Project Hub Turnover to operational record — first-class structured events rather than informal status changes or email threads.

The construction industry's "transition black hole" (con-tech UX study §8) is the period between a BD win and the Estimating team receiving their brief, or between Estimating completion and the Project team onboarding. During this gap:

- Context is lost: the BD team's strategic intelligence, key owner relationships, and risk flags don't transfer.
- Documents scatter: bid documents, RFPs, and scoping notes live in the BD team's folders with no automatic association to the Estimating pursuit.
- Ownership is opaque: the BIC system has no visibility into who is responsible during the transition period.
- There is no acknowledgment: the receiving party may not know a handoff has occurred until they discover a new record weeks later.

`@hbc/workflow-handoff` solves all four problems with a single platform-wide primitive: a typed, structured `IHandoffPackage<TSource, TDest>` that captures the source snapshot, field mappings, document links, context notes, recipient identity, and lifecycle status — and connects to `@hbc/bic-next-move` so the handoff itself becomes a visible BIC event.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Storage backend | SharePoint list `HBC_HandoffPackages` (per site) + Azure Functions API layer; package `sourceSnapshot` JSON stored inline if <255KB, Azure Blob file reference if larger (mirrors `@hbc/versioned-record` D-02 pattern); `destinationSeedData` and `documents` stored as JSON columns |
| D-02 | State machine | Linear 5-state machine: `draft → sent → received → acknowledged \| rejected`; acknowledgment is irreversible; rejection returns BIC to sender and marks source record for revision; no recall after `sent` |
| D-03 | Pre-flight validation | `config.validateReadiness()` is synchronous; called in Composer Step 1; blocking items prevent sending; non-blocking warnings surfaced but don't gate sending; zero blocking items required for Step 1 → Step 2 progression |
| D-04 | Field mapping snapshot semantics | `mapSourceToDestination` runs at package assembly time (not at acknowledgment time); `destinationSeedData` is frozen into the package at send; if source record changes after sending, destination receives the data as it was at the moment of send |
| D-05 | BIC transfer on send | When handoff is sent, source record BIC updates: recipient becomes current owner with expected action "Review and acknowledge handoff package"; on rejection, BIC returns to sender; on acknowledgment, a new BIC cycle begins in the destination module |
| D-06 | Document resolution | `resolveDocuments` is `async`, called at package assembly (Composer Step 2); document SharePoint URLs are captured as-is (documents are linked, not copied); HandoffApi checks `@hbc/sharepoint-docs` URL migration map on retrieval to keep links live after SharePoint migrations |
| D-07 | Rejection semantics | Recipient must provide a rejection reason (required); rejection fires `Watch`-tier notification to sender and a BIC return event; rejected packages are terminal — sender creates a new package after addressing the reason; no re-acknowledgment of a rejected package |
| D-08 | Complexity mode rendering | `HbcHandoffComposer` and `HbcHandoffReceiver` are full-panel PWA-primary components (not gated by Essential/Standard/Expert — handoff is an explicit high-stakes action); `HbcHandoffStatusBadge` is complexity-gated: Essential hidden; Standard badge only; Expert badge + last-update timestamp |
| D-09 | Generic type contract | `IHandoffPackage<TSource, TDest>` and `IHandoffConfig<TSource, TDest>` are generic over source and destination record types; `sourceSnapshot` serialized to JSON for storage; `destinationSeedData` as `Partial<TDest>` populated from `mapSourceToDestination`; consuming module provides type parameters |
| D-10 | Testing sub-path | `@hbc/workflow-handoff/testing` exports: `createMockHandoffPackage<S,D>()`, `createMockHandoffConfig<S,D>()`, `createMockHandoffDocument()`, `createMockContextNote()`, `mockHandoffStates` (5 canonical states) |

---

## Package Directory Structure

```
packages/workflow-handoff/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                                    # Main barrel export
│   ├── types/
│   │   ├── IWorkflowHandoff.ts                     # All interfaces, HandoffStatus, generics
│   │   └── index.ts
│   ├── constants/
│   │   ├── handoffDefaults.ts                      # List title, API base, stale times, status labels
│   │   └── index.ts
│   ├── api/
│   │   ├── HandoffApi.ts                           # send, acknowledge, reject, get, list
│   │   └── index.ts
│   ├── hooks/
│   │   ├── usePrepareHandoff.ts                    # Assembles IHandoffPackage from source + config
│   │   ├── useHandoffInbox.ts                      # Lists pending handoffs for current user
│   │   ├── useHandoffStatus.ts                     # Tracks outbound handoff status
│   │   └── index.ts
│   └── components/
│       ├── HbcHandoffComposer.tsx                  # 4-step sender panel (D-03, D-04, D-06)
│       ├── HbcHandoffReceiver.tsx                  # Recipient review + acknowledge/reject
│       ├── HbcHandoffStatusBadge.tsx               # Source record status indicator (D-08)
│       └── index.ts
├── testing/
│   ├── index.ts                                    # D-10: testing sub-path barrel
│   ├── createMockHandoffPackage.ts
│   ├── createMockHandoffConfig.ts
│   ├── createMockHandoffDocument.ts
│   ├── createMockContextNote.ts
│   └── mockHandoffStates.ts
└── src/__tests__/
    ├── setup.ts
    ├── HandoffApi.test.ts
    ├── usePrepareHandoff.test.ts
    ├── useHandoffInbox.test.ts
    ├── useHandoffStatus.test.ts
    ├── HbcHandoffComposer.test.tsx
    ├── HbcHandoffReceiver.test.tsx
    └── HbcHandoffStatusBadge.test.tsx
```

---

## Handoff State Machine (D-02)

```
             config.validateReadiness()
                    ↓
           ┌────────────────────────┐
           │        DRAFT           │  Package assembled; not yet sent
           │  (usePrepareHandoff)   │
           └────────────┬───────────┘
                        │ HandoffApi.send()
                        ↓
           ┌────────────────────────┐
           │         SENT           │  BIC → recipient (D-05); Immediate notification (D-05)
           └──────┬─────────────────┘
                  │ Recipient opens package
                  ↓
           ┌────────────────────────┐
           │       RECEIVED         │  Marks first view; no BIC change yet
           └──────┬──────────────────┘
                  │
          ┌───────┴────────┐
          │                │
          ↓                ↓
   ┌──────────────┐  ┌──────────────┐
   │ ACKNOWLEDGED │  │   REJECTED   │
   │ config.      │  │ config.      │
   │ onAcknowledged│ │ onRejected   │
   │ → dest record │ │ → BIC return │
   └──────────────┘  └──────────────┘
```

---

## Complexity Mode Rendering (D-08)

| Component | Essential | Standard | Expert |
|---|---|---|---|
| `HbcHandoffComposer` | Full panel (not gated) | Full panel | Full panel |
| `HbcHandoffReceiver` | Full panel (not gated) | Full panel | Full panel |
| `HbcHandoffStatusBadge` | Hidden | Badge label only | Badge label + last-update timestamp |

> Rationale (D-08): Handoff is an explicit high-stakes action — the sender actively opens the Composer; the recipient actively opens their Work Feed item. These interactions are intentional and should never be hidden. Only the passive status badge on the source record is complexity-gated.

---

## Confirmed Handoff Routes (Phase 7)

| Route | Source Module | Destination Module | Trigger | T07 Priority |
|---|---|---|---|---|
| BD → Estimating | `business-development` | `estimating` | Director approval of Go decision | P0 — Reference Implementation |
| Estimating → Project Hub | `estimating` | `project-hub` | Estimating project setup workflow completion | P1 — Second implementation |
| Project Hub Turnover → Ops | `project-hub-turnover` | `project-hub-ops` | All turnover sign-offs complete | P2 — Phase 8 |
| Admin Provisioning → All | `admin-provisioning` | `*` | Site provisioning completion | P3 — Phase 6 expansion |

---

## Integration Points

| Package | Integration Detail |
|---|---|
| `@hbc/bic-next-move` | Handoff sent → BIC updates to show recipient as current owner (D-05); rejection → BIC returns to sender; acknowledgment → new BIC cycle in destination module begins; `@hbc/workflow-handoff` does NOT import `@hbc/bic-next-move` — consuming module's BIC config reads handoff status |
| `@hbc/sharepoint-docs` | Document URLs in handoff package verified against URL migration map on retrieval (D-06); no direct document copy — links only |
| `@hbc/versioned-record` | Source snapshot created at handoff moment via consuming module's `onAcknowledged` callback; pinned to `tag: 'handoff'`; `@hbc/workflow-handoff` does NOT import `@hbc/versioned-record` |
| `@hbc/acknowledgment` | Handoff receipt acknowledgment is the same single-party required acknowledgment pattern; `HbcHandoffReceiver` composes `@hbc/acknowledgment` for the sign-off gesture |
| `@hbc/field-annotations` | Recipient can add field-level annotations to handoff package fields before acknowledging; `HbcHandoffReceiver` renders `HbcAnnotationMarker` adjacent to `destinationSeedData` preview fields |
| `@hbc/notification-intelligence` | Handoff sent → Immediate-tier to recipient; acknowledgment → Watch-tier to sender; rejection → Watch-tier to sender with rejection reason |
| My Work Feed (PH9b §A) | Pending handoff packages appear in recipient's My Work Feed as high-priority action items with the route name and sender identity |
| `@hbc/complexity` | `HbcHandoffStatusBadge` only (D-08) |

---

## SPFx Constraints

| Component | SPFx Behavior |
|---|---|
| `HbcHandoffComposer` | PWA-primary; in SPFx, a simplified read-only package summary is shown with a deep link to the PWA Composer |
| `HbcHandoffReceiver` | PWA-primary; in SPFx, a simplified read-only preview with deep link to the PWA Receiver |
| `HbcHandoffStatusBadge` | Fully supported in SPFx via `@hbc/ui-kit/app-shell` |
| `HandoffApi` | All calls route through Azure Functions; no direct SharePoint REST from components |

---

## Effort Estimates

| Task File | Scope | Estimate |
|---|---|---|
| T01 Package Scaffold | Directory, configs, barrel stubs | 0.25 sw |
| T02 TypeScript Contracts | Generic interfaces, state machine types, config shape, all sub-types | 0.5 sw |
| T03 Storage and API Layer | SharePoint list schema, Azure Functions contract, `HandoffApi.ts` | 0.75 sw |
| T04 Hooks | `usePrepareHandoff`, `useHandoffInbox`, `useHandoffStatus` with TanStack Query | 0.75 sw |
| T05 HbcHandoffComposer | 4-step multi-step panel (pre-flight → review → recipient → send) | 1.25 sw |
| T06 HbcHandoffReceiver + StatusBadge | Receiver review/acknowledge/reject panel + status badge (5 states) | 1.0 sw |
| T07 Reference Implementations | BD→Estimating config + Estimating→Project config + platform wiring patterns | 0.75 sw |
| T08 Testing Strategy | Testing sub-path, unit tests, Storybook stories, Playwright E2E | 0.75 sw |
| T09 Deployment | Pre-deploy checklist, ADR-0092, adoption how-to, API reference | 0.25 sw |
| **Total** | | **6.25 sprint-weeks** |

> Note: Source spec estimated 5–6 sprint-weeks. Additional 0.25 sw accounts for generic type contract complexity (D-09), `@hbc/acknowledgment` + `@hbc/field-annotations` bi-directional integration (T07), and D-10 testing sub-path. The Composer (T05) is the most complex deliverable — 4-step multi-panel with async pre-flight, document assembly, and recipient confirmation.

---

## Implementation Phasing

### Wave 1 — Contracts, Storage & Hooks (T01 + T02 + T03 + T04)
Foundation layer. All types locked, `HandoffApi` operational, all three hooks functional. Consuming modules can begin reading pending handoff counts from `useHandoffInbox`.

### Wave 2 — Components (T05 + T06)
`HbcHandoffComposer` 4-step panel operational. `HbcHandoffReceiver` review and acknowledge/reject functional. `HbcHandoffStatusBadge` renders all 5 states.

### Wave 3 — Reference Implementations & Wiring (T07)
BD-to-Estimating config complete and integrated. Estimating-to-Project config complete. BIC transfer pattern validated. All integration points confirmed in dev-harness.

### Wave 4 — Testing, Docs & Deployment (T08 + T09)
Testing sub-path published. ≥95% coverage enforced. ADR-0092 written. Developer adoption guide and API reference authored.

---

## Definition of Done

- [ ] `IHandoffPackage<TSource, TDest>` and `IHandoffConfig<TSource, TDest>` generic types exported
- [ ] `HandoffApi.send()`, `acknowledge()`, `reject()`, `get()`, `list()` implemented via Azure Functions
- [ ] `usePrepareHandoff` assembles a complete `IHandoffPackage` from source record + config, including async document resolution
- [ ] `useHandoffInbox` returns pending handoff packages for the current user, sorted by `sentAt` descending
- [ ] `useHandoffStatus` polls the status of an outbound handoff and notifies the component on status change
- [ ] `HbcHandoffComposer` 4-step flow: pre-flight (D-03) → review package (D-04, D-06) → confirm recipient → send (D-05)
- [ ] `HbcHandoffReceiver` renders source summary, documents, context notes, annotation markers (D-09 field-annotations), and acknowledge/reject CTAs
- [ ] `HbcHandoffStatusBadge` renders correctly for all 5 states: null, draft, sent, acknowledged, rejected (D-08)
- [ ] BD-to-Estimating `IHandoffConfig` implemented as reference implementation in `packages/business-development/src/handoff/`
- [ ] Estimating-to-Project Hub `IHandoffConfig` implemented in `packages/estimating/src/handoff/`
- [ ] BIC transfer pattern documented and validated in dev-harness (D-05)
- [ ] `@hbc/versioned-record` snapshot integration documented in T07 and adoption guide
- [ ] `@hbc/sharepoint-docs` URL migration-awareness confirmed in `HandoffApi.get()` (D-06)
- [ ] `@hbc/acknowledgment` composed inside `HbcHandoffReceiver` for acknowledgment sign-off gesture
- [ ] `@hbc/field-annotations` markers rendered on `destinationSeedData` preview fields in `HbcHandoffReceiver`
- [ ] Notification registration: sent → Immediate (recipient); acknowledgment → Watch (sender); rejection → Watch (sender with reason) — registered by Azure Functions
- [ ] `@hbc/workflow-handoff/testing` sub-path exports all 5 utilities (D-10)
- [ ] Unit tests ≥95% on state machine transitions, field mapping, pre-flight validation, and hook mutations
- [ ] `docs/architecture/adr/ADR-0092-workflow-handoff-platform-primitive.md` written and accepted
- [ ] `docs/how-to/developer/workflow-handoff-adoption.md` written
- [ ] `docs/reference/workflow-handoff/api.md` written
- [ ] `pnpm turbo run build --filter @hbc/workflow-handoff...` passes with zero errors
- [ ] `current-state-map.md §2` updated with SF08 plan classification

---

## Task File Index

| File | Contents |
|---|---|
| `SF08-T01-Package-Scaffold.md` | Directory tree, `package.json`, `tsconfig.json`, `vitest.config.ts`, barrel stubs |
| `SF08-T02-TypeScript-Contracts.md` | `IHandoffPackage<S,D>`, `IHandoffConfig<S,D>`, `HandoffStatus`, all sub-types, constants |
| `SF08-T03-Storage-and-API.md` | SharePoint list schema, Azure Functions contract, `HandoffApi.ts` full implementation |
| `SF08-T04-Hooks.md` | `usePrepareHandoff`, `useHandoffInbox`, `useHandoffStatus` — TanStack Query implementation |
| `SF08-T05-HbcHandoffComposer.md` | 4-step multi-panel Composer: pre-flight, review, recipient, send — full component code |
| `SF08-T06-HbcHandoffReceiver-and-StatusBadge.md` | Receiver panel (summary / docs / notes / CTAs) + 5-state StatusBadge |
| `SF08-T07-Reference-Implementations.md` | BD→Estimating config, Estimating→Project config, platform wiring patterns (BIC, versioned-record, notifications) |
| `SF08-T08-Testing-Strategy.md` | `testing/` sub-path exports, unit tests, Storybook stories, Playwright E2E scenarios |
| `SF08-T09-Deployment.md` | Pre-deploy checklist, ADR-0092 content, adoption how-to, API reference, verification commands |

<!-- IMPLEMENTATION PROGRESS & NOTES
SF08 master plan created: 2026-03-09
Status: In progress — T01 complete
Classification: Canonical Normative Plan
ADR required: ADR-0092 (next available after ADR-0091 used by SF07)
Note: Source spec referenced ADR-0017 — this was a pre-PH7 numbering; ADR-0092 is correct per CLAUDE.md §7

SF08-T01 completed: 2026-03-10
- Package scaffold created (30 files), SF07-aligned adjustments applied
- All verification gates passed: check-types, build, test, full workspace build

SF08-T02 completed: 2026-03-10
- Full TypeScript contract layer: 14 types/interfaces in IWorkflowHandoff.ts
- Full constants layer: 9 exports in handoffDefaults.ts
- IBicOwner re-export from @hbc/bic-next-move (SF07 pattern)
- Verification: check-types, build, runtime exports, full workspace build — all passed

SF08-T03 completed: 2026-03-10
- HandoffApi.ts: full implementation replacing export {} stub
- 9 public methods: create, get, inbox, outbox, send, markReceived, acknowledge, reject, updateContextNotes
- Internal helpers: apiFetch<T>, mapListItem<TSource, TDest> (D-01 snapshot overflow handling)
- IHandoffApi derived type export
- Verification: check-types, build, full workspace build (32/32) — all passed
Next: SF08-T04 (Hooks)

SF08-T03 remediation completed: 2026-03-10
- Created .eslintrc.cjs — lint gate now passes (--max-warnings 0)
- Removed unused imports (HandoffStatus, IBicOwner) from HandoffApi.ts — spec defect fix
- All gates green: check-types, build, lint, full workspace build (32/32)

SF08-T04 completed: 2026-03-10
- handoffQueryKeys.ts: query key factory (4 keys: inbox, outbox, package, outboundBySource)
- usePrepareHandoff.ts: full assembly hook with buildPreflightChecks helper (D-03, D-04, D-06)
- useHandoffInbox.ts: TanStack Query inbox hook with 90s staleTime
- useHandoffStatus.ts: TanStack Query status hook with conditional 30s polling (D-02)
- Barrel export updated: handoffQueryKeys added to hooks/index.ts
- IHandoffContextNote import kept per spec (unused at lint — removed during implementation)
- Verification: check-types, build, lint, full workspace build (32/32) — all passed
Next: SF08-T05 (HbcHandoffComposer)

SF08-T05 completed: 2026-03-10
- HbcHandoffComposer.tsx: full 4-step sender panel replacing export {} stub
- 5 internal components: StepIndicator, PreflightStep, ReviewStep, RecipientStep, SendStep
- 1 exported component: HbcHandoffComposer with state machine orchestrator
- 3 lint-compliance fixes applied: removed unused React/useMemo imports, removed unused IHandoffDocument import, prefixed unused _onRecipientOverride param
- No barrel changes needed (components/index.ts already wired in T01)
- Verification: check-types, build, lint, full workspace build (32/32) — all passed
Next: SF08-T06 (HbcHandoffReceiver and HbcHandoffStatusBadge)

SF08-T06 completed: 2026-03-10
- HbcHandoffReceiver.tsx: full recipient review panel (4 internal + 1 exported component)
- HbcHandoffStatusBadge.tsx: 5-state complexity-gated badge (1 exported component)
- 5 lint-compliance fixes: removed unused React/IBicOwner imports, prefixed _handoffId/_isTerminal, fixed tier vs variant destructuring
- Verification: check-types, build, lint, full workspace build (32/32) — all passed
Next: SF08-T07 (Reference Implementations)

SF08-T07 completed: 2026-03-10
- examples/reference-types.ts: IGoNoGoScorecardRef (14 fields), IEstimatingPursuitRef (17 fields), IProjectRecordRef (10 fields)
- examples/reference-apis.ts: DocumentApiRef, EstimatingApiRef, ScorecardApiRef, ProjectHubApiRef stub APIs
- examples/bdToEstimatingHandoffConfig.ts: P0 BD→Estimating IHandoffConfig with correct VersionApi.createSnapshot signature
- examples/estimatingToProjectHubConfig.ts: P1 Estimating→ProjectHub IHandoffConfig with correct VersionApi.createSnapshot signature
- examples/versioned-record.d.ts: ambient module declaration for type-checking without pulling full source tree
- tsconfig.build.json: build config excluding examples/ from dist output
- tsconfig.json: includes examples/**/* for type-checking
- Key correction: spec used non-existent contextPayload field; corrected to use real ICreateSnapshotInput signature (config, changeSummary, createdBy)
- Verification: check-types, build, lint, full workspace build (32/32) — all passed
- Architecture boundary: zero prohibited imports in src/
Next: SF08-T08 (Testing Strategy)

SF08-T08 completed: 2026-03-10
- testing/ sub-path: 5 factory functions + MockHandoffStates type — all corrected for actual IBicOwner/null types
- Unit tests: 109 tests across 7 test files — HandoffApi, usePrepareHandoff, useHandoffStatus, useHandoffInbox, HbcHandoffStatusBadge, HbcHandoffComposer, HbcHandoffReceiver
- Coverage: 99.89% stmts, 95.6% branches, 95.91% functions, 99.89% lines (all ≥95%)
- Storybook stories: 3 story files (Composer: 3 stories, Receiver: 4 stories, StatusBadge: 5 stories)
- Playwright E2E: 5 lifecycle scenarios as test.skip stubs (awaiting dev-harness routes)
- ~30 spec-vs-reality corrections applied during implementation
- Verification: check-types ✓, build ✓, lint ✓, test:coverage ✓
Next: SF08-T09 (Deployment)
-->
