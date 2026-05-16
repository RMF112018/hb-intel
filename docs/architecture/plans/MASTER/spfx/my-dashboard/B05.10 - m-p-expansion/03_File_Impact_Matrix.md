# File Impact Matrix

This matrix identifies the expected implementation touchpoints. The local agent must revalidate against current local repo truth before editing.

---

## A. Source schema / provisioning

| File | Expected Change |
|---|---|
| `backend/functions/src/services/my-projects/my-projects-source-list-schema.ts` | Add shared external link fields, Registry stage field, update target field composition |
| `scripts/provision-my-projects-source-list-schema.ts` | Likely descriptor-driven only; update tests/report expectations if needed |
| `scripts/sharepoint-field-rest-contract.ts` | Inspect only unless descriptor expansion exposes a Text-field support gap |
| `scripts/sharepoint-field-rest-contract.test.ts` | Inspect only unless contract support changes |
| `scripts/provision-my-projects-source-list-schema.test.ts` | Update expected planned creates/live verification paths |
| `backend/functions/src/services/projects-role-schema-readiness.ts` | Expand readiness field sets and expected type mapping |
| `scripts/verify-my-project-role-fields.ts` | Update documentation/comments/output framing; maintain read-only behavior |
| `scripts/verify-my-project-role-fields.test.ts` | Expand report coverage and field expectations |

---

## B. Projects mapping contract

| File | Expected Change |
|---|---|
| `backend/functions/src/services/projects-list-contract.ts` | Add Projects `buildingConnectedUrl` and `documentCrunchUrl` field-map entries; update optional fields |
| `backend/functions/src/services/projects-list-mapper.ts` | Only if domain DTOs need read/write conversion; otherwise preserve mapper scope beyond new `resolveSpField(...)` availability |
| `backend/functions/src/services/__tests__/projects-list-mapper.test.ts` | Update only if mapper behavior changes |

---

## C. Shared My Projects read-model contracts

| File | Expected Change |
|---|---|
| `packages/models/src/myWork/MyProjectLinksReadModel.ts` | Add actions, warning codes, summary counts |
| `packages/models/src/myWork/fixtures/myProjectLinksReadModels.ts` | Expand fixture items and summary builders |
| any `packages/models/src/myWork/*.test.ts` | Update if contracts are asserted |

---

## D. Backend My Projects provider

| File | Expected Change |
|---|---|
| `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts` | Source row fields, select fields, action builders, reconciliation, stage precedence, summary counts |
| `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.test.ts` | Full new action/stage/summary coverage |

---

## E. Frontend My Projects UI

| File | Expected Change |
|---|---|
| `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx` | Copy update; consolidated missing-destination hint |
| `apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.tsx` | Four launch options, new unavailable/invalid labels |
| `apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.module.css` | Adjust menu minimum width/spacing only if needed after four options |
| `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioTile.tsx` | Likely no direct change unless menu prop surface shifts |
| `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioBrowser.tsx` | No direct change expected; browser reuses tiles |
| `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx` | Update copy/menu/hint assertions |
| any `ProjectLaunchMenu*.test.tsx` | Add explicit option-order and invalid/unavailable coverage if present |

---

## F. Docs

| File | Expected Change |
|---|---|
| `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md` | Add target/live schema language for new Projects link fields |
| `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md` | Add target/live schema language for new Registry fields |
| `docs/reference/spfx-surfaces/my-dashboard/my-projects-schema-readiness.md` | Expand readiness semantics |
| `docs/how-to/administrator/provision-my-projects-source-list-schema.md` | Update provisioning workflow |
| `apps/my-dashboard/README.md` | Replace outdated dual-launch description if present |
| relevant B05A/dev-plan docs | Update only if they are actively treated as current implementation docs |

---

## G. Files to inspect for collateral impact

These may not require changes, but they should be inspected:

- `apps/my-dashboard/src/modules/myProjects/myProjectPortfolioPresentation.ts`
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioBrowser.tsx`
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-runtime-diagnostics.ts`
- `packages/models/src/myWork/index.ts`
- `packages/models/src/myWork/fixtures/index.ts`
- `apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts`
- any docs or tests that still use “dual launch” as current-state language
