# Repo Audit Findings — Phase 3 / Wave 5 Priority Actions Rail

## Audit Scope

The Wave 5 package was generated from repo-truth review of these areas:

- PCC planning and blueprint docs under `docs/architecture/blueprint/sp-project-control-center/`.
- Wave 4 closeout and Prompt 07 readiness records.
- PCC SPFx app under `apps/project-control-center/`.
- Project Home card, adapter, hook, and read-model wiring under `apps/project-control-center/src/surfaces/projectHome/`.
- SPFx read-model client/factory/backend client under `apps/project-control-center/src/api/`.
- SPFx guardrail tests under `apps/project-control-center/src/tests/`.
- Shared PCC models under `packages/models/src/pcc/`.
- Backend read-model host under `backend/functions/src/hosts/pcc-read-model/`.
- Backend no-runtime and route tests.
- SPFx UI doctrine under `docs/reference/ui-kit/doctrine/`.
- Existing `packages/ui-kit/src/HbcPriorityRail/**` as reference only.

## Wave 4 / Wave 5 Readiness Finding

Wave 5 may proceed.

`docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Closeout.md` establishes:

- Wave 4 is closed.
- Project Home has explicit opt-in backend read-model consumption.
- Fixture mode remains default.
- Backend mode is not a production rollout.
- Backend route family is read-only.
- Project Home is the only opt-in consumer.
- Wave 4A is operator-pending and separate.
- Priority Actions Rail standalone module is unblocked for Wave 5.

## Planning Findings

The Phase 3 planning docs identify Wave 5 as **Priority Actions Rail**.

Important sequencing:

1. Wave 4 — Project Home / Command Center.
2. Wave 4A — controlled non-production hosted visual validation gate.
3. Wave 5 — Priority Actions Rail.
4. Wave 5A — optional controlled hosted revalidation after Priority Actions Rail.
5. Wave 6 — Team & Access.

Wave 4A is not a prerequisite to Wave 5 implementation. Wave 4A remains separately authorized/operator-controlled hosted validation.

## PCC SPFx Findings

The PCC app exists at:

```text
apps/project-control-center/
```

Relevant scripts from `apps/project-control-center/package.json`:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
```

Current Project Home shape:

- `PccProjectHome` renders 10 cards in a React fragment.
- Those 10 cards remain direct children of `PccBentoGrid`.
- `PccPriorityActionsCard` already exists and currently renders `SAMPLE_PRIORITY_ACTIONS` or optional read-model actions.
- `PccProjectHomeReadModelContent` can pass read-model priority actions into the card from the `home` envelope.
- `useProjectHomeReadModel` currently fetches `home` and `document-control` in parallel under explicit opt-in.
- `PccSurfaceRouter` threads `readModelClient` only to `project-home`.
- `mount.tsx` creates a read-model client only when `_config.readModel` is supplied.

Current Project Home invariants that must survive Wave 5:

- Exactly 10 Project Home cards.
- Every card is a direct child of the bento grid.
- Exactly one `[data-pcc-active-surface-panel="project-home"]` marker, carried by Project Intelligence.
- No live launch URLs or executable actions on Project Home.
- No default backend fetch.

## Read-Model Client Findings

The SPFx read-model client defines seven route methods:

- `getProjectProfile`
- `getModuleRegistry`
- `getProjectHome`
- `getPriorityActions`
- `getDocumentControl`
- `getExternalLinks`
- `getSiteHealth`

The static route path for priority actions is:

```text
pcc/projects/{projectId}/priority-actions
```

The backend HTTP client:

- is the sole `fetch(` callsite in the PCC SPFx app;
- uses `GET` only;
- expects response body shape `{ data: PccReadModelEnvelope<T> }`;
- falls back safely to fixture `backend-unavailable` envelopes for missing base URL, missing fetch, network failure, non-2xx, malformed JSON, missing `data`, or non-envelope data;
- is selected only when `readModelMode: 'backend'` and non-empty `backendBaseUrl` are explicitly supplied.

## Shared Model Findings

`packages/models/src/pcc/PriorityActions.ts` defines:

- `IPriorityAction`
- `PriorityActionCategory`
- `PRIORITY_ACTION_CATEGORIES`
- `PRIORITY_ACTION_CATEGORY_LABELS`
- `PRIORITY_ACTION_CATEGORY_META`

Current categories:

```text
workflow
approval
compliance
inspection
permit
closeout
health
procore-sync
documents
safety
```

Wave 5 planning requires four display lanes:

```text
access requests
readiness blockers
approval/checkpoint prompts
external-system mapping prompts
```

These are not canonical model categories today. The closed decision is therefore to create an **app-local grouping adapter** and defer shared model mutation.

Current fixture actions include categories that must be visible and categories that must be suppressed:

Visible / mappable examples:

- `workflow`
- `approval`
- `compliance`
- `inspection`
- `permit`
- `closeout`
- `procore-sync`

Suppressed from the user-facing Wave 5 MVP rail:

- `documents`
- `health`
- `safety`

## Backend Findings

The backend route host exists at:

```text
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
```

It registers:

```text
GET /api/pcc/projects/{projectId}/priority-actions
```

Handler name:

```text
getPccProjectPriorityActions
```

The backend mock provider returns:

```ts
{ actions: SAMPLE_PRIORITY_ACTIONS }
```

for known projects, and empty/fallback envelopes for unknown/backend-unavailable cases.

Backend route tests assert:

- exactly seven routes;
- all routes are GET-only;
- no write methods;
- each route is wrapped with auth middleware posture;
- response body is `{ data: envelope }`;
- missing `projectId` returns validation error.

No backend route creation is required for Wave 5.

## Guardrail Findings

`apps/project-control-center/src/tests/pcc-api-dormancy.test.ts` is now a controlled-consumption guard. It asserts:

- fixture remains the factory default;
- non-api/non-test `src/api` imports are narrowly allowlisted;
- `fetch(` callsites are limited to the backend client and its direct test;
- no forbidden runtime imports/tokens appear in SPFx source or `src/api/**`;
- backend HTTP client is GET-only;
- `PccSurfaceRouter` threads `readModelClient` to exactly one surface, Project Home;
- `mount.tsx` invokes only `createPccReadModelClient` and no lower-level client constructor or fetch.

Wave 5 must update this guard narrowly only if implementation changes make a targeted new exception necessary.

## UI Doctrine Findings

PCC is governed by:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`

Relevant binding expectations:

- host-aware SPFx composition;
- no fake SharePoint shell duplication;
- premium command-center composition is allowed;
- bento/cockpit dashboard composition is allowed;
- variable card sizes and flexible grids are allowed;
- fixed equal-height row layout is not acceptable as the default command-center posture;
- widgets need explicit purpose, layout, state/seam, accessibility, and evidence contracts.

## UI-Kit Priority Rail Finding

`packages/ui-kit/src/HbcPriorityRail/types.ts` defines a shared visual priority rail API. It is explicitly data-layer decoupled.

Closed Wave 5 decision:

- do not directly import/reuse `HbcPriorityRail` in the PCC app during Wave 5;
- treat it as reference only;
- build a PCC-local component that respects Project Home bento/card constraints;
- revisit UI-kit promotion after Wave 5 behavior is accepted.

## Recommended Implementation Posture

Wave 5 should:

- keep rail placement inside the existing `PccPriorityActionsCard`;
- introduce `priorityActionsRailViewModel` and `priorityActionsRailAdapter` under `apps/project-control-center/src/surfaces/projectHome/`;
- create a PCC-local rail UI component;
- update the existing Project Home card to render the rail;
- only then wire standalone `getPriorityActions` under explicit backend opt-in;
- update guardrails and tests to prove no execution, no mutation, no new fetch callsite, no backend default, no unsafe category leakage, and no direct UI-kit rail import.
