> **Tier 1 Classification Banner**
> **Document Class:** Canonical Normative Plan
> **Status:** Active — PH7.13 remediation; may be implemented independently of PH7.12 sign-off as a quality-infrastructure addition
> **Governs:** `packages/eslint-plugin-hbc/`, `.eslintrc.base.js`, `.github/workflows/ci.yml`, all stub-bearing source files in `packages/`, `apps/`, `backend/`
> **ADR:** ADR-0095 (see `docs/architecture/adr/0095-stub-detection-enforcement-standard.md`)
> **Next available ADR after this plan:** ADR-0096

---

# PH7.13 — Stub Detection and Incomplete Implementation Enforcement

**Plan Version:** 1.0
**Date:** 2026-03-10
**Phase Reference:** DOCS-AUDIT (2026-03-10) → Gap remediation; extension of Phase 7 quality infrastructure
**Depends On:** PH7.8 (Test Governance Normalization), PH7.5 (ESLint boundary rules in `eslint-plugin-hbc`)
**Estimated Effort:** 1.0 sprint-week
**Blocking:** None — this plan adds quality gates; it does not restructure any existing package
**ADR Required:** `docs/architecture/adr/0095-stub-detection-enforcement-standard.md`

> **Doc Classification:** Canonical Normative Plan — PH7.13 implementation master plan for stub detection enforcement; governs all task files PH7.13-T01 through PH7.13-T09.

---

## Objective

The DOCS-AUDIT phase (2026-03-10) established that the HB Intel codebase has **zero automated enforcement** against stub implementations and incomplete code. Known stubs — `acknowledgments/stubs.ts`, `BicModuleRegistry.ts` server aggregation, `cd.yml` SPFx deploy — are silently committed with no lint warning, no CI gate, and no pre-commit hook. This plan closes that gap by introducing three enforcement layers, an escape-hatch convention for intentional stubs, and remediating the known stub inventory with explicit exemptions.

---

## 3-Line Plan

1. Add `no-warning-comments` and `@typescript-eslint/ban-ts-comment` to `.eslintrc.base.js`; create a new `no-stub-implementations` rule in `packages/eslint-plugin-hbc/`.
2. Add a CI grep-scan step to `.github/workflows/ci.yml`; apply `// stub-approved: <reason>` markers to all intentional stubs in the known inventory.
3. Run all four mechanical gates; confirm zero new lint errors; confirm all known stubs are either remediated or explicitly exempted; update `current-state-map.md §2`.

---

## Background: DOCS-AUDIT Findings (2026-03-10)

The DOCS-AUDIT phase inspected all SF\*-T09-\*.md files and, as a byproduct, performed a codebase-wide stub survey. The survey found:

| Layer | Status |
|-------|--------|
| ESLint `no-warning-comments` | **Absent** — TODO/FIXME comments are silently committed |
| ESLint `@typescript-eslint/ban-ts-comment` | **Absent** — `@ts-ignore` has no description requirement |
| Custom stub-detection rule | **Absent** — `throw new Error('not implemented')` is not caught |
| CI grep scan | **Absent** — no workflow step scans for stub patterns |
| Git pre-commit hooks | **Absent** — no Husky or lint-staged configured |
| Existing stubs (live, undetected) | **6 confirmed** (see §Known Stub Inventory) |

The `branches: 95` coverage gate (ADR-0085, PH7.8) provides partial mitigation for the P1 packages, but does not prevent stub-pattern commits or cover packages outside P1.

---

## Scope: Three Enforcement Layers

```
Layer 1 — ESLint (static, local + CI)
  ├── no-warning-comments           →  surfaces TODO/FIXME at lint time
  ├── @typescript-eslint/ban-ts-comment  →  requires description on @ts-ignore
  └── @hb-intel/hbc/no-stub-implementations  →  blocks throw-not-implemented pattern

Layer 2 — CI Grep Scan (explicit, fail-fast)
  └── ci.yml lint-and-typecheck job  →  grep for unapproved throw-not-implemented
                                         across packages/, apps/, backend/

Layer 3 — Stub Inventory Remediation
  └── All 6 known stubs  →  either implemented or marked // stub-approved: <reason>
```

**Escape hatch convention (D-04):** Any stub that is intentional and tracked must be marked with an inline comment immediately preceding the stub code:

```typescript
// stub-approved: <non-empty reason explaining intent and tracking reference>
```

A blank or missing reason is not valid. The CI grep and ESLint rule both exclude lines carrying this marker.

---

## Known Stub Inventory (Pre-PH7.13)

| # | File | Stub Description | Disposition |
|---|------|-----------------|-------------|
| S-01 | `backend/functions/src/functions/acknowledgments/stubs.ts` | BIC-completion, notification, next-party notification — log-only stubs | `stub-approved` marker (pending SF04 full integration) |
| S-02 | `packages/bic-next-move/src/registry/BicModuleRegistry.ts` | Server-side BIC aggregation endpoint — log-only stub (D-07) | `stub-approved` marker (locked decision: server aggregation deferred to PH8) |
| S-03 | `tools/mocks/sp-core-library.ts` | SPFx `@microsoft/sp-core-library` mock for jsdom | Globally exempt — `tools/mocks/` excluded from all scans (D-06) |
| S-04 | `tools/mocks/sp-property-pane.ts` | SPFx PropertyPane API mock for jsdom | Globally exempt — `tools/mocks/` excluded from all scans (D-06) |
| S-05 | `tools/mocks/sp-webpart-base.ts` | `BaseClientSideWebPart` stub for jsdom | Globally exempt — `tools/mocks/` excluded from all scans (D-06) |
| S-06 | `.github/workflows/cd.yml` (SPFx deploy job) | `if: false` deploy job with `echo "SPFx deploy is stubbed"` | `# stub-approved:` YAML marker (pending Vite-to-.sppkg pipeline, PH8) |

---

## Locked Decisions (ADR-0095)

Full decision rationale is in `docs/architecture/adr/0095-stub-detection-enforcement-standard.md`.

| # | Decision | Locked Choice |
|---|----------|--------------|
| D-01 | `no-warning-comments` severity | `warn` level — surfaces debt without blocking CI on existing TODOs |
| D-02 | `ban-ts-comment` severity | `error` level — bare `@ts-ignore` requires ≥10-character description |
| D-03 | `no-stub-implementations` rule | `error` level in `eslint-plugin-hbc` — detects throw-not-implemented on source files |
| D-04 | Escape-hatch convention | `// stub-approved: <non-empty reason>` on the preceding line suppresses both ESLint and CI grep |
| D-05 | CI grep as Layer 2 | Grep step in `lint-and-typecheck` job; fails job on any unapproved match; complements ESLint |
| D-06 | `tools/mocks/` global exemption | Entire directory excluded from ESLint override and CI grep — SPFx SDK mocks by design |
| D-07 | BIC aggregation stub deferred | `BicModuleRegistry.ts` server aggregation exempted with `stub-approved`; PH8 activation item |
| D-08 | Full inventory closure required | PH7.13 does not close until all 6 known stubs are dispositioned and CI grep returns zero |

---

## Task Index

| Task | File | Description | Effort |
|------|------|-------------|--------|
| T01 | `PH7.13-T01-ESLint-Base-Config.md` | Add `no-warning-comments` and `@typescript-eslint/ban-ts-comment` to `.eslintrc.base.js` | 0.1 sw |
| T02 | `PH7.13-T02-No-Stub-Implementations-Rule.md` | Create `no-stub-implementations` rule in `eslint-plugin-hbc`; register and enable | 0.3 sw |
| T03 | `PH7.13-T03-CI-Grep-Scan.md` | Add grep scan step to `.github/workflows/ci.yml` `lint-and-typecheck` job | 0.1 sw |
| T04 | `PH7.13-T04-Stub-Inventory-Remediation.md` | Apply `stub-approved` markers to S-01, S-02, S-06; confirm S-03/04/05 globally exempt | 0.2 sw |
| T05 | `PH7.13-T05-Scan-Stubs-Tool.md` | Create `tools/scan-stubs.ts` developer tool; add `pnpm scan-stubs` scripts | 0.2 sw |
| T09 | `PH7.13-T09-Deployment.md` | Documentation, ADR creation, README update, ADR index update, mechanical gates | 0.1 sw |

**Recommended implementation order:** T01 → T02 → T03 → T04 → T05 → T09

T01 and T03 are mechanical file edits with no dependencies on each other and can be done in parallel. T04 depends logically on T02 (so the new rule passes with `stub-approved` markers in place). T05 is independent tooling. T09 must be last.

---

## Acceptance Criteria (Definition of Done)

### Layer 1 — ESLint

- [ ] `no-warning-comments: warn` active in `.eslintrc.base.js`; `pnpm turbo run lint` surfaces existing TODOs as warnings
- [ ] `@typescript-eslint/ban-ts-comment: error` active; bare `@ts-ignore` fails lint
- [ ] `no-stub-implementations` rule registered in `packages/eslint-plugin-hbc/src/index.js`
- [ ] Rule fires on `throw new Error('not implemented')` with no `stub-approved` marker
- [ ] Rule is suppressed by valid `// stub-approved: <reason>` marker
- [ ] Rule is applied in `.eslintrc.base.js` override for `packages/*/src/**`, `apps/**`, `backend/**`
- [ ] Rule is excluded for `**/*.test.ts`, `**/*.spec.ts`, `tools/mocks/**`, `**/testing/**`

### Layer 2 — CI Scan

- [ ] CI grep step added to `lint-and-typecheck` job in `.github/workflows/ci.yml`
- [ ] CI step excludes `dist/`, `node_modules/`, `coverage/`, `tools/mocks/`, `*.test.*`, `*.spec.*`
- [ ] CI step excludes lines containing `stub-approved:`
- [ ] CI step fails job and prints the offending lines if unapproved stubs are found

### Layer 3 — Stub Inventory Remediation

- [ ] S-01 (`acknowledgments/stubs.ts`) — `stub-approved` marker applied with tracking reason
- [ ] S-02 (`BicModuleRegistry.ts`) — `stub-approved` marker applied with PH8 deferral reference
- [ ] S-03, S-04, S-05 (`tools/mocks/`) — confirmed globally exempt; no markers required
- [ ] S-06 (`cd.yml` SPFx deploy) — `# stub-approved:` YAML marker applied
- [ ] Full CI grep scan returns zero unapproved results

### Tooling

- [ ] `tools/scan-stubs.ts` created; `pnpm scan-stubs` exits 0 after inventory remediation
- [ ] `pnpm scan-stubs:all` lists all `stub-approved` entries for visibility

### Documentation & Governance

- [ ] `docs/architecture/adr/0095-stub-detection-enforcement-standard.md` written and accepted
- [ ] `packages/eslint-plugin-hbc/README.md` updated to document `no-stub-implementations` rule and `stub-approved` convention
- [ ] `docs/README.md` ADR index updated with ADR-0095 entry
- [ ] `current-state-map.md §2` updated with PH7.13 task file classification rows

### Mechanical Gates (CLAUDE.md §6.3.3)

- [ ] `pnpm turbo run build` — zero errors
- [ ] `pnpm turbo run lint` — zero errors (warnings for existing TODOs are expected and acceptable)
- [ ] `pnpm turbo run check-types` — zero TypeScript errors
- [ ] `pnpm turbo run test --filter=@hbc/auth-core --filter=@hbc/shell --filter=@hbc/ui-kit --filter=@hbc/shared-kernel --filter=@hbc/app-types` — all pass; `branches: 95` maintained

---

## Blueprint Progress Comment

After all acceptance criteria are met, add this comment block to `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.13 completed: {DATE}
Stub Detection and Incomplete Implementation Enforcement — three-layer enforcement added.
Layer 1: ESLint rules (no-warning-comments, ban-ts-comment, no-stub-implementations)
Layer 2: CI grep scan in lint-and-typecheck job
Layer 3: All 6 known stubs remediated or exempted with stub-approved markers
ADR created: docs/architecture/adr/0095-stub-detection-enforcement-standard.md
Tool added: tools/scan-stubs.ts (pnpm scan-stubs)
All four mechanical enforcement gates passed.
current-state-map.md §2 updated: PH7.13 task file rows added.
Next: PH7.12 final verification or PH8 CI/CD expansion per Foundation Plan sequencing.
-->
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.13 authored: 2026-03-10
Plan restructured: 2026-03-10 — broken into task file family (T01–T05, T09).
Status: Master plan complete — task files ready for implementation.
Triggered by: DOCS-AUDIT phase (2026-03-10), six known stubs confirmed undetected.
ADR assigned: ADR-0095 (next available after ADR-0094 / SF09-Data-Seeding).
Implementation ready to begin at T01 (no blockers; PH7.8 ESLint infrastructure already in place).
Task files: PH7.13-T01 through PH7.13-T05, PH7.13-T09.
Next: PH7.13-T01 (ESLint Base Config)
-->
