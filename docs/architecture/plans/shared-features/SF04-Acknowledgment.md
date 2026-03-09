# SF04 — `@hbc/acknowledgment` Implementation Plan

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Package:** `packages/acknowledgment/`
**Blueprint Reference:** HB-Intel-Blueprint-V4 §Shared Packages
**Priority:** P0 — Required by Project Hub Turnover Meeting, PMP, and BD scorecard approval workflows
**Estimated Effort:** 3.5 sprint-weeks
**ADR to Create:** `docs/architecture/adr/0013-acknowledgment-platform-primitive.md`

---

## Purpose

`@hbc/acknowledgment` makes structured sign-off a platform primitive applicable to any HB Intel record type. It provides a generic `IAcknowledgmentConfig<T>` contract, three acknowledgment modes (single / parallel / sequential), three UI components, an Azure Function backend, SharePoint list persistence, offline resilience, and testing utilities — eliminating per-module sign-off implementations and creating a cross-module audit trail.

---

## Locked Decisions (All 10)

| ID | Topic | Decision |
|---|---|---|
| D-01 | Sequential enforcement | Hard server-side enforcement; `bypassSequentialOrder` flag requires `AcknowledgmentAdmin` role; bypass written as `status: 'bypassed'` |
| D-02 | Optimistic updates | TanStack Query `onMutate`/`onError` rollback; network failures → `@hbc/session-state` offline queue; client-side `acknowledgedAt` |
| D-03 | Confirmation phrase | `confirmationPhrase?: string` on config; default `"I CONFIRM"`; modal: "Type [phrase] to proceed" |
| D-04 | Decline reason | `declineReasons?: string[]` on config; absent = free-text min 10 chars; provided = radio buttons + optional elaboration |
| D-05 | Data fetching | `staleTime: 30_000`, `refetchOnWindowFocus: true`, `refetchInterval: 60_000`; mutation invalidates immediately |
| D-06 | Completion trigger | Azure Function fires BIC transfer + notification on completion; client `onAllAcknowledged` = UI-only effects |
| D-07 | Complexity integration | Panel: Essential = CTA, Standard = party list, Expert = audit trail; Badge floor = Standard; Expert adds hover tooltip |
| D-08 | Context type identity | `ACK_CONTEXT_TYPES` exported const registry; typed union; new adoptions register via PR |
| D-09 | Parallel decline logic | Any required party decline → immediate `'declined'`; `isComplete: false`; record owner resolves |
| D-10 | Testing sub-path | `@hbc/acknowledgment/testing`: factories, `mockAckStates` (6 canonical), `mockUseAcknowledgment`, `createAckWrapper` |

---

## Directory Structure

```
packages/acknowledgment/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                          # Main barrel
│   ├── types/
│   │   ├── IAcknowledgment.ts            # All interfaces and types
│   │   └── index.ts
│   ├── config/
│   │   └── contextTypes.ts               # ACK_CONTEXT_TYPES registry (D-08)
│   ├── hooks/
│   │   ├── useAcknowledgment.ts          # Load state, submit, offline queue (D-02, D-05)
│   │   └── useAcknowledgmentGate.ts      # Current user eligibility
│   └── components/
│       ├── HbcAcknowledgmentPanel.tsx    # Full sign-off UI; complexity-gated (D-07)
│       ├── HbcAcknowledgmentBadge.tsx    # Compact list-row status (D-07)
│       ├── HbcAcknowledgmentModal.tsx    # Confirmation + decline modal (D-03, D-04)
│       └── index.ts
└── testing/
    ├── index.ts                          # Testing sub-path barrel (D-10)
    ├── createMockAckConfig.ts
    ├── createMockAckState.ts
    ├── mockAckStates.ts                  # 6 canonical states
    ├── mockUseAcknowledgment.ts
    └── createAckWrapper.tsx
```

---

## `ACK_CONTEXT_TYPES` Registry (D-08)

| Key | Value | Module |
|---|---|---|
| `PROJECT_HUB_PMP` | `'project-hub-pmp'` | Project Hub — PMP section approval |
| `PROJECT_HUB_TURNOVER` | `'project-hub-turnover'` | Project Hub — Turnover Meeting sign-off |
| `PROJECT_HUB_MONTHLY_REVIEW` | `'project-hub-monthly-review'` | Project Hub — Monthly Review step |
| `BD_SCORECARD` | `'bd-scorecard'` | Business Development — Go/No-Go scorecard |
| `ESTIMATING_BID_RECEIPT` | `'estimating-bid-receipt'` | Estimating — Bid document receipt |
| `ADMIN_PROVISIONING` | `'admin-provisioning'` | Admin — Provisioning task sign-off |
| `WORKFLOW_HANDOFF` | `'workflow-handoff'` | `@hbc/workflow-handoff` — Handoff receipt |

---

## Mode Behaviour Summary

| Mode | Completion Logic | Decline Logic (D-09) | Sequential Gate (D-01) |
|---|---|---|---|
| `single` | 1 of 1 required parties acknowledged | Immediate block | N/A |
| `parallel` | All required parties acknowledged | Any decline → immediate `'declined'`; blocks all | N/A |
| `sequential` | All required parties acknowledged in order | Same as parallel | Server enforces order; bypass requires `AcknowledgmentAdmin` + `bypassSequentialOrder: true` |

---

## Optimistic Update + Offline Queue Flow (D-02)

```
User clicks "Acknowledge"
  │
  ├─ onMutate: snapshot cache → update cache optimistically → show "pending sync" indicator removed
  │
  ├─ POST /api/acknowledgments
  │    ├─ SUCCESS (2xx):
  │    │    ├─ onSuccess: invalidate query → refetch true state
  │    │    └─ Azure Function fires completion side-effects if isComplete (D-06)
  │    │
  │    ├─ LOGICAL FAILURE (4xx):
  │    │    └─ onError: restore snapshot → error toast
  │    │
  │    └─ NETWORK FAILURE (TypeError / 0 / 408 / 503):
  │         └─ onError: write to @hbc/session-state offline queue
  │              └─ show "pending sync" indicator on party row
  │
  └─ On reconnect: session-state replays queued acknowledgment → POST retried
```

---

## Complexity Integration (D-07)

### `HbcAcknowledgmentPanel`

| Tier | Rendered Content |
|---|---|
| Essential | Action CTA only: "Your acknowledgment is required." + Acknowledge / Decline buttons |
| Standard | Full party list: avatar, name, role, status badge, timestamp per party |
| Expert | Full party list + complete audit trail: prompt message preserved, IP address (if present), all timestamps |

### `HbcAcknowledgmentBadge`

| Tier | Rendered Content |
|---|---|
| Essential | Same as Standard (floor = Standard per D-07) |
| Standard | ✓/⏳/✗ icon + "N of M acknowledged" count |
| Expert | Standard content + hover tooltip listing pending party names |

---

## SharePoint List: `HbcAcknowledgmentEvents`

| Column | Type | Notes |
|---|---|---|
| `EventId` | Single line | GUID primary key |
| `ContextType` | Choice | Values from `ACK_CONTEXT_TYPES` (D-08) |
| `ContextId` | Single line | Record ID |
| `PartyUserId` | Single line | UPN of acknowledging user |
| `PartyDisplayName` | Single line | Display name at acknowledgment time |
| `Status` | Choice | `acknowledged` / `declined` / `bypassed` |
| `AcknowledgedAt` | Date/Time | UTC; client timestamp for offline events (D-02) |
| `DeclineReason` | Multiple lines | Free text or elaboration (D-04) |
| `DeclineCategory` | Single line | Selected option from `declineReasons[]` if configured (D-04) |
| `PromptMessage` | Multiple lines | Message shown at time of sign-off (audit preservation) |
| `IsBypass` | Yes/No | True when `bypassSequentialOrder: true` used (D-01) |
| `BypassedBy` | Single line | UPN of admin who authorised bypass (D-01) |

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | Acknowledgment due = BIC state; Azure Function fires BIC transfer on completion (D-06) |
| `@hbc/notification-intelligence` | Azure Function dispatches: acknowledgment request → `Immediate` tier; completion → `Watch` tier (D-06) |
| `@hbc/complexity` | Panel complexity gates (D-07); badge floor = Standard (D-07) |
| `@hbc/session-state` | Offline queue for network-failed acknowledgment attempts (D-02) |
| `@hbc/workflow-handoff` | Handoff receipt triggers acknowledgment event; completion unblocks handoff |

---

## Effort Estimates

| Task File | Description | Estimate |
|---|---|---|
| T01 | Package scaffold, config, barrel stubs | 0.25 sw |
| T02 | TypeScript contracts + `ACK_CONTEXT_TYPES` | 0.25 sw |
| T03 | `useAcknowledgment` + `useAcknowledgmentGate` hooks | 0.5 sw |
| T04 | `HbcAcknowledgmentPanel` (all three modes + complexity) | 0.75 sw |
| T05 | `HbcAcknowledgmentBadge` + `HbcAcknowledgmentModal` | 0.5 sw |
| T06 | Azure Function + SharePoint list + setup script | 0.5 sw |
| T07 | Offline queue integration (`@hbc/session-state`) | 0.25 sw |
| T08 | Testing strategy (unit + Storybook + E2E) | 0.25 sw |
| T09 | Deployment: checklist, ADR, guides, progress comments | 0.25 sw |
| **Total** | | **3.5 sw** |

---

## Implementation Waves

| Wave | Tasks | Goal |
|---|---|---|
| 1 | T01, T02, T06 | Scaffold, contracts, SharePoint list deployed |
| 2 | T03, T07 | Hooks with offline queue wired |
| 3 | T04, T05 | All three components across all modes |
| 4 | T08, T09 | Tests, Storybook, deployment, ADR |

---

## Definition of Done (20 items)

- [ ] `IAcknowledgmentConfig<T>` contract defined and exported
- [ ] `ACK_CONTEXT_TYPES` registry exported with 7 initial entries (D-08)
- [ ] `useAcknowledgment` loads and mutates acknowledgment state (D-05)
- [ ] `useAcknowledgment` implements optimistic update + rollback (D-02)
- [ ] `useAcknowledgment` queues network failures to `@hbc/session-state` (D-02)
- [ ] `useAcknowledgmentGate` returns current user eligibility correctly for all three modes
- [ ] `HbcAcknowledgmentPanel` renders correctly in `single` mode
- [ ] `HbcAcknowledgmentPanel` renders correctly in `parallel` mode including decline-blocked state (D-09)
- [ ] `HbcAcknowledgmentPanel` renders correctly in `sequential` mode including locked rows and bypassed rows (D-01)
- [ ] `HbcAcknowledgmentPanel` complexity gates correctly (Essential/Standard/Expert per D-07)
- [ ] `HbcAcknowledgmentBadge` renders at Standard floor minimum; Expert adds tooltip (D-07)
- [ ] `HbcAcknowledgmentModal` handles confirmation phrase (D-03), free-text decline (D-04), and category decline (D-04)
- [ ] `HbcAcknowledgmentEvents` SharePoint list deployed via setup script with all columns including `IsBypass` and `BypassedBy` (D-01)
- [ ] `POST /api/acknowledgments` Azure Function: sequential order enforcement + bypass flag + `AcknowledgmentAdmin` role check (D-01)
- [ ] Azure Function fires BIC transfer + notification on completion (D-06)
- [ ] `@hbc/session-state` offline queue replays acknowledgments on reconnect (D-02)
- [ ] `@hbc/acknowledgment/testing` sub-path exports all five utilities (D-10)
- [ ] Unit tests ≥ 95% on mode logic, gate logic, completion detection, decline logic
- [ ] Storybook: all three modes, declined state, bypassed state, offline-pending state
- [ ] `docs/architecture/adr/0013-acknowledgment-platform-primitive.md` written

---

## Task File Index

| File | Contents |
|---|---|
| `SF04-T01-Package-Scaffold.md` | Directory tree, `package.json`, `tsconfig.json`, `vitest.config.ts`, barrel stubs |
| `SF04-T02-TypeScript-Contracts.md` | All interfaces, types, constants, `ACK_CONTEXT_TYPES` registry |
| `SF04-T03-Hooks.md` | `useAcknowledgment` (fetch, mutate, optimistic, offline) + `useAcknowledgmentGate` |
| `SF04-T04-Panel.md` | `HbcAcknowledgmentPanel` — all three modes, complexity gating, sequential stepper |
| `SF04-T05-Badge-and-Modal.md` | `HbcAcknowledgmentBadge` (complexity), `HbcAcknowledgmentModal` (phrase, decline) |
| `SF04-T06-API-and-SharePoint.md` | Azure Function, SharePoint list schema, setup script |
| `SF04-T07-Offline-Queue.md` | `@hbc/session-state` integration, replay logic, "pending sync" indicator |
| `SF04-T08-Testing-Strategy.md` | Testing sub-path, unit tests, Storybook stories, Playwright E2E |
| `SF04-T09-Deployment.md` | Pre-deployment checklist, ADR-0013, integration guide, blueprint progress comment |

<!-- IMPLEMENTATION PROGRESS & NOTES
SF04-T01 completed: 2026-03-09 — Package scaffold created with all config, barrels, and testing sub-path
SF04-T02 completed: 2026-03-09 — TypeScript contracts (11 types/interfaces), ACK_CONTEXT_TYPES (7 entries), acknowledgmentLogic.ts (5 functions + 2 constants)
SF04-T03 completed: 2026-03-09 — useAcknowledgment hook (fetch, mutation, optimistic update, offline queue stub), useAcknowledgmentGate selector, ackKeys factory, 11 unit tests passing
SF04-T04 completed: 2026-03-09 — HbcAcknowledgmentPanel with complexity-gated rendering (essential/standard/expert), EssentialCTA, StandardPartyList, ExpertAuditTrail sub-components, modal integration, decline/completion banners
SF04-T05 completed: 2026-03-09 — HbcAcknowledgmentBadge (complexity floor D-07, expert tooltip, all visual states) + HbcAcknowledgmentModal (D-03 phrase validation, D-04 decline radios/free-text, "Other" dedup), 25 new tests (36 total), @testing-library/jest-dom added to setup
Next: SF04-T06 (Testing Utilities)
-->
