# Required Repo-Truth Files

## Root / Package Files

```text
package.json
pnpm-lock.yaml
turbo.json
CLAUDE.md
```

Read `CLAUDE.md` only if needed to confirm repo agent conventions. Do not edit it in this package.

## Models

```text
packages/models/package.json
packages/models/src/pcc/index.ts
packages/models/src/pcc/ExternalSystems.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/PccUserRoles.ts
packages/models/src/pcc/PriorityActions.ts
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/CheckpointInstance.ts
packages/models/src/pcc/fixtures/index.ts
packages/models/src/pcc/fixtures/integrations.ts
packages/models/src/pcc/fixtures/Fixtures.test.ts
```

## Backend

```text
backend/functions/package.json
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts
```

## SPFx PCC App

```text
apps/project-control-center/package.json
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccReadModelClientFactory.ts
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemTile.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsHeaderCard.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsProcoreConfigurationStatusCard.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.module.css
apps/project-control-center/src/tests/PccExternalSystemsSurface.test.tsx
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
```

## Integration Seam Files

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts
apps/project-control-center/src/surfaces/projectHome/useProjectHomeReadModel.ts
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessViewModel.ts
apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx
apps/project-control-center/src/surfaces/approvals/approvalsAdapter.ts
apps/project-control-center/src/viewModels/approvalsPriorityActionsAdapter.ts
apps/project-control-center/src/viewModels/approvalsReadinessReferencesAdapter.ts
```

## Wave 15 Docs / Artifacts

Use `reference/02_CANONICAL_WAVE15_DOCS_AND_ARTIFACTS.md`.

## UI Doctrine / Standards

Inspect only if implementing UX details or tests require it:

```text
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/standards/SPFx-Surface-Quality-Standard.md
docs/reference/ui-kit/standards/SPFx-Breakpoint-and-Container-Fit-Standard.md
docs/reference/ui-kit/standards/SPFx-State-Model-Standard.md
docs/reference/ui-kit/patterns/SPFx-Command-Center-Dashboard-Patterns.md
docs/reference/ui-kit/patterns/SPFx-Widget-and-Bento-Layout-Patterns.md
```
