---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: External Platforms surface copy alignment (narrow, user-facing only)
generated: 2026-05-06
status: Add-on prompt — runs between Prompt 03 and Prompt 04
---

# Prompt 03A — External Platforms Surface Copy Alignment

## Position in Add-On Sequence

Run after Prompt 03 (Surface Context De-Duplication and State Model), before Prompt 04 (Command Preview and Active Panel Accessibility). 03A is a narrow copy-only remediation. It must not absorb Prompt 05 (External Platforms and Routing Integrity).

## Role

You are the PCC host shell add-on remediation implementation agent.

## Objective

Align user-facing surface titles, card titles, and cross-surface reference labels so the locked product names — tab label `External Platforms`, page title `External Platforms Launch Pad` — render consistently across the SPFx app and consumer surfaces. Strictly preserve the internal ID `external-systems` everywhere it functions as a route key, kind discriminator, data attribute, type literal member, switch case, route family identifier, file/folder name, or component name.

This is **not** a routing-integrity prompt. Routing, router shape, manifest, version, and lockfile state must remain unchanged.

## Required Reads

Use active context first. Read only files you will edit, the immediately adjacent test files, and the type definitions needed to compile.

```text
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsHeaderCard.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx
apps/project-control-center/src/surfaces/projectHome/PccExternalSystemsCard.tsx
apps/project-control-center/src/viewModels/approvalsReadinessReferencesAdapter.ts
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts
apps/project-control-center/src/surfaces/constraintsLog/constraintsLogAdapter.ts
apps/project-control-center/src/surfaces/buyoutLog/buyoutLogAdapter.ts
apps/project-control-center/src/surfaces/documents/documentControlViewModel.ts
apps/project-control-center/src/surfaces/documents/PccDocumentControlPermissionsCard.tsx
apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
packages/models/src/pcc/PccCapabilities.ts
packages/models/src/pcc/PccFeatureFlags.ts
packages/models/src/pcc/fixtures/projectReadiness.ts
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
apps/project-control-center/src/tests/PccDocumentsSurface.tier.test.tsx
apps/project-control-center/src/tests/PccProcoreSurfaceCards.test.tsx
apps/project-control-center/src/tests/PccExternalSystemsRegistryHealthAudit.test.tsx
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.test.ts
```

## Allowed Scope

1. Replace user-facing rendered text `External Systems` → `External Platforms` where the text refers to the tab/surface name.
2. Set the External Platforms in-surface page header to read `External Platforms Launch Pad` using the existing `eyebrow` / `title` split (`eyebrow="External Platforms"` + `title="Launch Pad"`).
3. Update test assertions and test names that mirror those user-facing strings.
4. Update model-side `displayName` strings on capabilities, feature-flag descriptions, and fixture labels that render through to UI.

## Forbidden Scope (hard guardrails)

- No route changes.
- No `PccSurfaceRouter` changes.
- No internal-ID changes — `'external-systems'` is preserved everywhere it appears as a route segment, `kind:` discriminator, `data-*` attribute, type literal member, switch case, route family identifier, file/folder name, or component name.
- No component / file / folder renames (`surfaces/externalSystems/`, `PccExternalSystemsSurface`, `PccExternalSystemsHeaderCard`, `PccExternalSystemsCard`).
- No backend / API / Graph / PnP / Procore runtime work.
- No SPFx package or manifest version bump.
- No `pnpm-lock.yaml` drift.
- No `git push`.
- No broad `External Systems` search-and-replace that mutates technical identifiers, internal comments / JSDoc, or category-language describing the integration domain.
- No edits to `surfaceHeroCopy.ts` description copy (already correct).
- No read-model client shape changes.
- No broadening into Prompt 05 routing-integrity scope.

## Implementation Sequence

1. Active context first. Re-read only the files being edited and the immediate tests asserting the changed strings.
2. App-side surface copy first (header card, surface loading/error eyebrow, project-home card title).
3. App-side cross-surface labels (approvals references, project readiness module label + status caption surface-name token, constraints/buyout target labels, document control lane title + permission EX family + source-state messages).
4. Models package edits (capabilities `displayName`, feature-flag description surface-name token, fixture title + sourceReferenceLabel). Run `pnpm --filter @hbc/models build` after, before re-running SPFx tests.
5. Test assertion alignment (test names + the one composition test that mirrors the rendered card title).
6. Add-on package doc updates (this prompt's entry in README-addon.md execution sequence and docs/12 implementation order).
7. Validation.
8. Closeout doc under the wave-b2 folder.

## Validation

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/models build
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- \
  PccExternalSystemsSurface PccExternalSystemsHeaderCard \
  PccProjectHome PccDocumentsSurface PccDocumentControl \
  PccProcoreSurfaceCards PccHorizontalTabs sourceStateMessaging \
  constraintsLog buyoutLog projectReadinessAdapter approvalsReadinessReferencesAdapter
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml
```

`md5 pnpm-lock.yaml` must match before/after. `dist/` under `packages/models` must not be staged. SPFx manifest and `package-solution.json` must not change.

## Closeout Requirements

Document:

- files inspected;
- files changed;
- tri-state status (prior issue no longer observed; current target — copy alignment landed; known intact — internal IDs, routing, file/component names, manifest/lockfile, comments);
- validation results;
- lockfile MD5 before/after;
- guardrails preserved;
- residual judgment calls (e.g., feature-flag lowercase-vs-uppercase split);
- next-prompt handoff confirming Prompt 04 and Prompt 05 scopes are unchanged.

Hosted/tenant proof remains operator-pending. Do not include a predicted changed-file count; report `git diff --cached --name-only` / `--stat` as the source of truth.
