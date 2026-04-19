# Source Index and Research Map

## Attached-package sources inspected

### Attached audit package

- `00-Audit-Summary.md`
- `01-Hosted-Function-Registration-and-Deployment-Assessment.md`
- `02-Build-Artifact-Composition-and-Minimality-Assessment.md`
- `03-Code-Hygiene-Best-Practices-and-Microsoft-Guidance-Assessment.md`
- `04-Findings-Register.md`
- `05-Recommended-Remediation-Sequence.md`
- `README.md`

### Attached prompt package

- `Plan-Summary.md`
- `Prompt-01-close-sync-run-persistence-boundary.md`
- `Prompt-02-reconcile-hosting-model-and-deployment-truth.md`
- `Prompt-03-split-legacy-fallback-from-the-shared-functions-host.md`
- `Prompt-04-minimize-artifact-composition-to-legacy-fallback-runtime.md`
- `Prompt-05-harden-hosted-validation-and-closure-proof.md`
- `README.md`

## Key repo files inspected

- `backend/functions/package.json`
- `backend/functions/host.json`
- `backend/functions/src/index.ts`
- `backend/functions/src/functions/legacyFallbackDiscovery/index.ts`
- `backend/functions/src/functions/adminApi/index.ts`
- `backend/functions/src/functions/adminApi/legacy-fallback-routes.ts`
- `backend/functions/src/hosts/admin-control-plane/index.ts`
- `backend/functions/src/services/legacy-fallback/discovery-service.ts`
- `backend/functions/src/services/legacy-fallback/discovery-repository.ts`
- `backend/functions/src/services/legacy-fallback/discovery-graph-client.ts`
- `backend/functions/src/services/legacy-fallback/project-index-provider.ts`
- `backend/functions/src/services/legacy-fallback/hosting-config.ts`
- `backend/functions/src/services/legacy-fallback/source-config.ts`
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`
- `backend/functions/src/services/legacy-fallback/README.md`
- `backend/functions/src/services/projects-list-mapper.ts`
- `packages/models/src/provisioning/ILegacyProjectFallback.ts`
- `scripts/package-functions-artifact.ts`
- `scripts/provision-legacy-fallback-hosting.ts`
- `.github/workflows/deploy-functions.yml`
- `infra/legacy-fallback-hosting.bicep`
- `infra/monitoring.bicep`
- `docs/how-to/administrator/provision-legacy-fallback-hosting.md`
- `docs/how-to/administrator/run-legacy-fallback-discovery.md`
- `docs/how-to/administrator/legacy-fallback-production-readiness-checklist.md`

## External guidance areas checked

- Azure Functions deployment technologies by hosting plan
- Azure Functions zip deployment behavior
- Azure Functions run-from-package caveats
- Azure Functions Flex Consumption deployment path
- pnpm deploy behavior in workspaces
- pnpm `node-linker=hoisted` rationale
- Node package entrypoint/module metadata behavior

## Research translation rule used in this package

External guidance was not treated as abstract background reading. It was translated only where it changed a concrete repo decision, such as:

- whether `config-zip` is a safe Flex closure instruction,
- whether `pnpm deploy` is a valid portable-artifact strategy,
- whether hoisted output is a defensible deploy choice,
- and whether the repo should preserve or remove certain artifact assumptions.
