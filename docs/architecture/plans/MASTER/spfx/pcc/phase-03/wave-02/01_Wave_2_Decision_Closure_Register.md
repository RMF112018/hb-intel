# Phase 3 Wave 2 — Decision Closure Register

## Decision Status

All Wave 2 open decisions are closed. Implementation may proceed only after Prompt 01 confirms current repo truth and records the scope lock.

## Closed Decisions

| ID | Decision | Closed Position | Status |
|---|---|---|---|
| W2-ODR-001 | Exact SPFx shell target location | Create/use `apps/project-control-center/` as the dedicated PCC shell app target. Use `packages/spfx` only for shared SPFx host/root exports if repo pattern requires it. Do not place PCC shell code in `apps/hb-webparts/` or extend `apps/project-sites/`. | Frozen for Wave 2 |
| W2-ODR-002 | New app vs existing app vs docs-only | Wave 2 may create the new app scaffold after Prompt 01 verifies clean repo state and Wave 1 closeout. | Proof-Gated |
| W2-ODR-003 | Manifest/package version bump policy | No manifest, solution, or package version bump in initial Wave 2 scaffold unless a specific implementation prompt authorizes it. | Frozen for Wave 2 |
| W2-ODR-004 | Dev harness wiring | Allow Vite/local preview wiring. Defer dev-harness tab wiring unless the implementation agent proves an existing repo-supported pattern and no production/manifest impact. | Proof-Gated |
| W2-ODR-005 | Preview/mock adapter location | Use app-local preview/read-model adapters under `apps/project-control-center/src/`. Do not create a shared adapter package in Wave 2. | Frozen for Wave 2 |
| W2-ODR-006 | Shell route model | Use internal state/tab navigation backed by `PCC_MVP_SURFACE_IDS`. Do not add a router library unless Prompt 01 proves an existing convention requires it. | Frozen for Wave 2 |
| W2-ODR-007 | First project context source | Use Wave 1 deterministic fixtures as the default project context. Allow optional injected runtime context only as non-live display input. No backend API, Graph, PnP, Procore, or tenant call. | Frozen for Wave 2 |
| W2-ODR-008 | Persona/capability behavior | Treat persona/capability metadata as display hints only. It must not become authoritative authorization. | Frozen for Wave 2 |
| W2-ODR-009 | Fallback/preview behavior | Require preview, empty, loading, error, missing-config, unavailable-fixture, and unauthorized-persona states. | Frozen for Wave 2 |
| W2-ODR-010 | No-runtime source scan location | Place no-runtime/no-forbidden-import guard tests in the touched PCC app package. Promote only later if repeated across packages. | Frozen for Wave 2 |
| W2-ODR-011 | Wave 1 closeout gate | Implementation is blocked until Prompt 01 verifies Wave 1 closeout on `main`. | Proof-Gated |
| W2-ODR-012 | What waits for Wave 3 backend read model | Live reads, persisted project data, authoritative authorization, live Site Health, workflow counts, access execution, approval execution, repair execution, and tenant seams wait for Wave 3 or later. | Deferred |
| W2-ODR-013 | Document Control treatment | Document Control is a unified access hub only: SharePoint Drive, OneDrive, Procore Files, Document Crunch, Adobe Sign source cards/launch placeholders. No document-management workflow. | Frozen for Wave 2 |
| W2-ODR-014 | External Systems treatment | Launch links and missing-configuration states only. No sync, mirror, write-back, API client, secrets, or direct SPFx-to-external-system path. | Frozen for Wave 2 |
| W2-ODR-015 | Site Health treatment | Read-model summary/indicator frame only, using fixtures. Include repair-request entry placeholder only. No scanner, runner, repair executor, Graph/PnP, or backend persistence. | Frozen for Wave 2 |
| W2-ODR-016 | Team & Access treatment | Project team summary placeholder and access-request entry placeholder only. No permission mutation, no group mutation, no approval execution. | Frozen for Wave 2 |
| W2-ODR-017 | Wave 2 UI/UX scope | Wave 2 includes real shell-frame UI/UX work: layout, visual hierarchy, navigation, responsive behavior, state handling, preview cards, and accessibility. It does not include live module operations. | Frozen for Wave 2 |
| W2-ODR-018 | PCC layout model | PCC must not reuse the `hb-intel-homepage` fixed paired-row layout. PCC shall use a controlled flexible bento/masonry-style layout with unique card heights and spans. | Frozen for Wave 2 |
| W2-ODR-019 | Basis-of-design asset | The saved design reference at `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` is the governing visual-direction asset for Wave 2 UI/UX. | Frozen for Wave 2 |

## Implementation Rule

If current repo truth conflicts with any closed position, the agent must stop and document the conflict in the Prompt 01 scope lock before writing code. Otherwise, these decisions are binding for Wave 2.
