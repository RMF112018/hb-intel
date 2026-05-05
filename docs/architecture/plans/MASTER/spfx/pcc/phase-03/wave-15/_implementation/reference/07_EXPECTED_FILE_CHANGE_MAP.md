# Expected File Change Map

This map is guidance, not a license to edit everything. Each prompt must stage only files it actually changes.

## Prompt 02

Likely files:

```text
packages/models/src/pcc/ExternalSystems.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/fixtures/integrations.ts
packages/models/src/pcc/fixtures/index.ts
packages/models/src/pcc/fixtures/Fixtures.test.ts
packages/models/src/pcc/ExternalSystems.test.ts
```

## Prompt 03

Likely files:

```text
backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
```

## Prompt 04

Likely files:

```text
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccReadModelClientFactory.ts
apps/project-control-center/src/api/pccBackendReadModelClient.test.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
```

## Prompt 05-07

Likely files:

```text
apps/project-control-center/src/surfaces/externalSystems/**
apps/project-control-center/src/tests/PccExternalSystems*.test.tsx
```

## Prompt 08

Likely files:

```text
apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/src/surfaces/projectReadiness/**
apps/project-control-center/src/viewModels/*ExternalSystems*.ts
apps/project-control-center/src/tests/*ExternalSystems*.test.ts
apps/project-control-center/src/tests/*Priority*.test.ts
apps/project-control-center/src/tests/*Readiness*.test.ts
```

## Prompt 09

Likely files:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_Implementation_Closeout.md
```

Only add closeout docs if the prompt authorizes it.
