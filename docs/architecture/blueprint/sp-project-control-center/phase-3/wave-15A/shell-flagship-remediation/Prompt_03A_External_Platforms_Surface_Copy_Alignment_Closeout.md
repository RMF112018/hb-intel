# Wave 15A — wave-b2 — Prompt 03A — External Platforms Surface Copy Alignment — Closeout

## 1. Objective

Sweep residual user-facing `External Systems` strings across the PCC SPFx app and the read-model fixture/registry so the locked product names — tab label `External Platforms` and in-surface page title `External Platforms Launch Pad` — render consistently. Internal route key, kind discriminator, type literal members, `data-*` attributes, switch cases, file/folder names, and component names (`'external-systems'`, `surfaces/externalSystems/`, `PccExternalSystemsSurface`, `PccExternalSystemsHeaderCard`, `PccExternalSystemsCard`) are preserved. No routes, router shape, internal IDs, manifests, package versions, or lockfile state changed.

This is the narrow add-on prompt that runs after Prompt 03 (Surface Context De-Duplication) and before Prompt 04 (Command Preview / a11y) so accessibility validation in Prompt 04 lands against the final user-facing label set. It is **not** the routing-integrity prompt — Prompt 05 still owns that scope.

## 2. Files Changed

Authoritative source: `git diff --cached --name-only` after staging. The pre-existing modifications to `apps/project-control-center/config/package-solution.json`, `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json`, and `tools/spfx-shell/config/package-solution.json` are **out of scope** for 03A and are not staged in this commit.

### App surface (PCC SPFx)

| File                                                                                        | Change                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsHeaderCard.tsx` | `title="External Systems"` → `title="Launch Pad"`. Eyebrow already binds to `SURFACE.displayName` (resolves to `External Platforms`); reading order produces "External Platforms Launch Pad", matching the in-surface loading/error header pattern.                       |
| `apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx`    | Loading + error states: `eyebrow="External Systems"` → `eyebrow="External Platforms"` (lines 126, 144). `title="Launch Pad"` already correct.                                                                                                                             |
| `apps/project-control-center/src/surfaces/projectHome/PccExternalSystemsCard.tsx`           | Project Home dashboard card `title="External Systems"` → `title="External Platforms"`. Eyebrow `"Integrations"` preserved.                                                                                                                                                |
| `apps/project-control-center/src/viewModels/approvalsReadinessReferencesAdapter.ts`         | Source-module display label map: `'external-systems': 'External Systems'` → `'External Platforms'`. ID-map line `'external-systems': 'external-systems'` preserved.                                                                                                       |
| `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts`      | Domain label `'External Systems'` → `'External Platforms'`. Downstream module spec `label: 'External Systems'` → `'External Platforms'` and `statusCaption` surface-name token `External Systems Launch Pad` → `External Platforms Launch Pad` (other wording preserved). |
| `apps/project-control-center/src/surfaces/constraintsLog/constraintsLogAdapter.ts`          | Cross-surface `targetLabel: 'External Systems'` → `'External Platforms'`. `targetId: 'external-systems'` preserved.                                                                                                                                                       |
| `apps/project-control-center/src/surfaces/buyoutLog/buyoutLogAdapter.ts`                    | Cross-surface `targetLabel: 'External Systems'` → `'External Platforms'`. `targetId: 'external-systems'` preserved.                                                                                                                                                       |
| `apps/project-control-center/src/surfaces/documents/documentControlViewModel.ts`            | Wave 7 lane title map: `'external-systems': 'External Systems'` → `'External Platforms'`. Lane key `'external-systems'` preserved.                                                                                                                                        |
| `apps/project-control-center/src/surfaces/documents/PccDocumentControlPermissionsCard.tsx`  | Action family title map `EX: 'External Systems'` → `'External Platforms'`. WAVE7_HARD_NO_FALLBACK HN-03 description leading noun `'External systems remain…'` → `'External platforms remain…'`.                                                                           |
| `apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts`                | User-facing error messages: `'External systems are not available…'` → `'External platforms are not available…'` and `'External systems are not configured…'` → `'External platforms are not configured…'`.                                                                |
| `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`                          | WAVE7_HARD_NO_FALLBACK HN-03 description aligned to the permission-card copy: `'External systems remain…'` → `'External platforms remain…'` (the read-model envelope and consumer card render identical wording).                                                         |

### Models package (`@hbc/models`)

| File                                                   | Change                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/models/src/pcc/PccCapabilities.ts`           | Capability `displayName` `'View External Systems'` → `'View External Platforms'`; `'Configure External Systems'` → `'Configure External Platforms'`. Capability IDs (`view-external-systems`, `configure-external-systems`) and persona-capability arrays preserved.                                                                                                                                                                           |
| `packages/models/src/pcc/PccFeatureFlags.ts`           | `external-system-launch-links` description: surface-name token `External Systems surface` → `External Platforms surface`. Lowercase data-category language `configured external systems` preserved. Flag id `external-system-launch-links` preserved.                                                                                                                                                                                          |
| `packages/models/src/pcc/fixtures/projectReadiness.ts` | Fixture `fixture-pcc-readiness-006`: `title: 'External systems closeout posture'` → `'External platforms closeout posture'`; `sourceLineage.sourceReferenceLabel: 'External Systems closeout posture'` → `'External Platforms closeout posture'`. The descriptive `description` field's `external systems module` lowercase phrase preserved (data-category language, not surface-name token). `sourceModuleId: 'external-systems'` preserved. |

### Tests (assertion / test-name alignment)

| File                                                                                        | Change                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/project-control-center/src/tests/PccProjectHome.test.tsx`                             | Required-card-titles array `'External Systems'` → `'External Platforms'`; test name `'External Systems card renders…'` → `'External Platforms card renders…'`; describe-section banner comment swapped.           |
| `apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx`                 | Card-title position assertion `indexOfTitle(titles, 'External Systems')` → `'External Platforms'`.                                                                                                                |
| `apps/project-control-center/src/tests/PccDocumentsSurface.tier.test.tsx`                   | Two test names: `'External Systems lane carries…'` and `'External Systems lane card emits…'` → `'External Platforms lane …'`. Lane key assertions on `'external-systems'` preserved.                              |
| `apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx`                        | Two test names swapped to `'External Platforms lane renders…'` and `'External Platforms: disabled entry renders…'`. Selectors on `[data-pcc-doc-lane="external-systems"]` preserved.                              |
| `apps/project-control-center/src/tests/PccProcoreSurfaceCards.test.tsx`                     | Module docblock + describe block: `External Systems` → `External Platforms` for the surface-name reference.                                                                                                       |
| `apps/project-control-center/src/tests/PccExternalSystemsRegistryHealthAudit.test.tsx`      | Describe block `'External Systems surface — Prompt 07 cross-card guardrails'` → `'External Platforms surface — …'`.                                                                                               |
| `apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts`                     | Test name `'…at least one External Systems entry'` → `'…at least one External Platforms entry'`. Filter on `wave7Lane === 'external-systems'` preserved.                                                          |
| `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.test.ts` | Test name `'…with the External Systems Launch Pad status caption'` → `'…with the External Platforms Launch Pad status caption'`. Caption assertion still asserts `caption.toLowerCase()` contains `'launch pad'`. |

### Add-on package documentation

| File                                                                                                                                  | Change                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b2/README-addon.md`                                                   | Inserted Prompt 03A in the "Recommended Execution" block between Prompt 03 and Prompt 04. Path prefix corrected from `prompts/` to `prompts-2/` to match the actual on-disk folder. Added scope-and-position paragraph.                                  |
| `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b2/docs/12_Risk_Register_And_Implementation_Order.md`                 | Inserted line `4a. Prompt 03A — External Platforms surface copy alignment` in the Recommended Add-On Implementation Order, added a Position Rule, and added a risk-register row plus extended the existing "External Platforms label drifts" mitigation. |
| `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b2/prompts-2/Prompt_03A_External_Platforms_Surface_Copy_Alignment.md` | New prompt file. Defines scope, allowed/forbidden boundaries, reads, sequence, validation, and closeout requirements for Prompt 03A.                                                                                                                     |

No `PACKAGE_MANIFEST.md` exists at the wave-b2 add-on level; the wave-15A-level `PACKAGE_MANIFEST.md` is parent-scoped and is not modified by 03A. Final closeout / handoff trackers will list 03A alongside Prompts 01–06 when those are written.

## 3. Tri-State Status

- **Prior issue no longer observed:** the split-name inconsistency where the tab rail and shell hero rendered `External Platforms` while the External Platforms surface header card, the Project Home dashboard card, the Document Control lane title and EX permission family, the cross-surface reference labels (Approvals references, Constraints, Buyout, Project Readiness), and the source-state error messages still rendered `External Systems`.
- **Current target — landed:** 03A user-facing copy alignment. The in-surface page header reads `External Platforms Launch Pad` (eyebrow `External Platforms` + title `Launch Pad`). All cross-surface display labels and capability `displayName`s read `External Platforms`. Test assertions and test names mirror the new copy.
- **Known intact:** internal route key / kind discriminator / `data-*` attributes / type literal members (`'external-systems'`); file and folder names (`surfaces/externalSystems/`); component names (`PccExternalSystemsSurface`, `PccExternalSystemsHeaderCard`, `PccExternalSystemsCard`, `PccExternalSystemsLaunchPadHeaderCard`); router shape (`PccSurfaceRouter` switch cases); read-model client interface; SPFx manifest and `package-solution.json`; `pnpm-lock.yaml`. Internal JSDoc / comments (`api/pccReadModelClient.ts:83,303`, `pccBackendReadModelClient.ts:202`, `surfaces/documents/PccDocumentsSurface.tsx:24`, `surfaces/approvals/approvalsAdapter.ts:256`, `shell/PccSurfaceRouter.tsx:31`, surface JSDoc headers describing Wave 15 history) preserved.

## 4. Validation

```bash
git status --short
md5 pnpm-lock.yaml                       # c56df7b79986896624536aab74d609f4 (before)
pnpm --filter @hbc/models build          # PASS (tsc clean)
pnpm --filter @hbc/spfx-project-control-center check-types
                                         # PASS (tsc --noEmit clean)
pnpm --filter @hbc/spfx-project-control-center test -- --run \
  PccExternalSystemsSurface PccExternalSystemsHeaderCard \
  PccProjectHome PccDocumentsSurface PccDocumentControl \
  PccProcoreSurfaceCards PccHorizontalTabs sourceStateMessaging \
  constraintsLog buyoutLog projectReadinessAdapter \
  approvalsReadinessReferencesAdapter pccFixtureReadModelClient \
  PccExternalSystemsRegistryHealthAudit
                                         # PASS — 84 test files / 1753 tests / 0 failures
pnpm exec prettier --check <changed-files>
                                         # PASS — all matched files use Prettier code style
git diff --check                         # clean
md5 pnpm-lock.yaml                       # c56df7b79986896624536aab74d609f4 (after — match)
```

Hosted/tenant proof remains **operator-pending** and is not in scope for 03A.

## 5. Lockfile and Models Build

- `pnpm-lock.yaml` MD5 unchanged before and after the edit window (`c56df7b79986896624536aab74d609f4`). No `pnpm install` / `pnpm add` / `pnpm update` commands were run.
- `pnpm --filter @hbc/models build` ran after editing `packages/models/src/pcc/**` and before SPFx test/check-types so consumers resolve the updated `dist/` outputs. `dist/` is gitignored and is not staged.

## 6. Guardrails Preserved

- No internal-ID change.
- No route or `PccSurfaceRouter` change.
- No file/folder/component rename.
- No backend / API / Graph / PnP / Procore runtime work.
- No SPFx manifest or `package-solution.json` change. The pre-existing modifications to `apps/project-control-center/config/package-solution.json`, `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json`, and `tools/spfx-shell/config/package-solution.json` (visible in `git status` at the start of this prompt) are out of scope and are not staged.
- No `pnpm-lock.yaml` drift.
- No `git push`.
- No Prompt 05 routing-integrity scope absorbed.
- No edits to `surfaceHeroCopy.ts`.

## 7. Residual Risk and Judgment Calls

- **Feature flag description** (`PccFeatureFlags.ts: external-system-launch-links`): the description contains both a surface-name token ("External Systems surface" → updated to "External Platforms surface") and a lowercase data-category phrase ("configured external systems"). The lowercase phrase was preserved as data-category language (not a surface-name reference). If product copy decides to use "external platforms" lowercase as the data-category vocabulary as well, a follow-up prompt should sweep the lowercase phrasing across feature-flag descriptions, JSDoc, and adapter comments.
- **Internal JSDoc / comments**: Wave 15 / Prompt 04 history references in `api/*.ts` files and the `useProcoreSurfaceReadModel.ts` JSDoc still reference "External Systems" historically. These are technical/architecture commentary, not user-facing copy; leaving them preserves Wave 15 history. They can be aligned in a future docs sweep without behavioral risk.
- **Approvals adapter comment** (`surfaces/approvals/approvalsAdapter.ts:256`): the comment "External Systems owns the catalog and mapping references…" describes the data-ownership category and is internal commentary — preserved.

## 8. Next-Prompt Handoff

- **Prompt 04 (Command Preview and Active Panel Accessibility):** scope unchanged. A11y work now validates against the final user-facing label set (`External Platforms`, `External Platforms Launch Pad`).
- **Prompt 05 (External Platforms and Routing Integrity):** scope unchanged. Internal route key `external-systems` and `PccSurfaceRouter` switch cases are intact; routing integrity work in 05 has the same surface to operate on.
- **Prompt 06 (Host Fit, Responsive Evidence, and Closeout):** scope unchanged.

Hosted/tenant proof for the new label rendering remains **operator-pending**.
