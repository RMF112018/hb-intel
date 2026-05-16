# 02 — Global Guardrails, Allowed Scope, and Forbidden Scope

## Global Ground Rules

Every prompt must preserve these rules:

1. Do not re-read files that are still within current context or memory unless repo truth is stale, missing, contradictory, or exact edit context must be verified.
2. Do not use `git add .`.
3. Stage explicitly by file path only.
4. Do not commit until prompt-specific validations pass.
5. Do not push unless explicitly instructed by the user outside this package.
6. Do not fabricate hosted evidence.
7. Do not silently broaden scope when a repo contradiction appears.

## Global Allowed Source Areas

The implementation prompts may touch only these categories when authorized:

### Shared layout cleanup

```text
apps/my-dashboard/src/layout/MyWorkBentoGrid.module.css
apps/my-dashboard/src/layout/MyWorkCard.tsx
apps/my-dashboard/src/layout/MyWorkCard.module.css
apps/my-dashboard/src/layout/MyWorkCard.test.tsx
```

### Adobe module

```text
apps/my-dashboard/src/modules/adobeSign/**
```

### View-model shaping

```text
apps/my-dashboard/src/state/myWorkCardViewModel.ts
```

### Final closeout docs

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/**
```

## Forbidden Scope

Do not modify:

```text
backend/**
backend/functions/**
packages/models/**
packages/ui-kit/**
apps/my-dashboard/package.json
pnpm-lock.yaml
SPFx manifests
.sppkg artifacts
GitHub workflows
tenant deployment config
Azure Function configuration
Adobe Sign OAuth backend routes
SharePoint provisioning
```

## Special Backend Rule

The package does not authorize backend changes. If backend data quality appears to limit the Completed view, document it in Prompt 08 closeout.

## Dependency Rule

Do not add dependencies.  
Do not modify package manifests.  
Do not modify lockfiles.

Use only:

- existing app imports;
- existing exports already available through repo-truth-confirmed packages;
- native semantic HTML/CSS.

## URL Safety Rule

Do not synthesize Adobe Sign URLs.

Render row Open action only when:

```text
sourceOpenUrl
```

already exists in normalized UI data.

## Future-Wave Rule

Do not implement:

- drawers;
- modal readers;
- write-back flows;
- mass Adobe Sign navigation systems;
- full activity history pages;
- new backend endpoints.

## Commit Scope Rule

Each prompt's commit must include only the files changed for that prompt. If unrelated dirty files exist, leave them untouched and report them.

## Validation Failure Rule

If validation fails:

- do not stage;
- do not commit;
- report exact failure;
- identify whether failure is pre-existing or prompt-induced;
- stop before expanding scope.
