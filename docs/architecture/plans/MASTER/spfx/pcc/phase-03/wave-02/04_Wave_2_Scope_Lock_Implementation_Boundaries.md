# Phase 3 Wave 2 — Scope Lock and Implementation Boundaries

## Wave 2 Objective

Build the PCC SPFx shell frame and UI/UX foundation using the closed decisions and basis-of-design image. Wave 2 creates the user experience frame; it does not implement live project operations.

## Allowed Work

Subject to Prompt 01 verification, Wave 2 may create or modify:

```text
apps/project-control-center/**
packages/spfx/src/webparts/projectControlCenter/**        # only if repo pattern requires shared root exports
packages/spfx/package.json                                # only if export map must expose the PCC root and prompt authorizes it
apps/project-control-center/package.json
apps/project-control-center/src/**
apps/project-control-center/tsconfig*.json
apps/project-control-center/vite.config.*
apps/project-control-center/*.md
apps/project-control-center/**/*.test.ts
apps/project-control-center/**/*.test.tsx
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/**
```

## Conditionally Allowed Work

```text
apps/dev-harness/**
```

Only if the implementation agent proves an existing harness precedent, adds no production effect, and records the proof in Prompt 01 or the relevant prompt closeout.

## Forbidden Work

```text
backend/functions/**
packages/project-site-template/**
packages/project-site-provisioning/**
apps/hb-webparts/src/webparts/hbHomepage/**
.github/**
infra/**
dist/**
*.sppkg
```

Forbidden unless explicitly authorized by a future prompt:

- package or SPFx manifest version bumps;
- app catalog packaging or upload;
- CI/CD deployment changes;
- live Graph/PnP calls;
- tenant reads/writes/mutations;
- SharePoint group or permission mutation;
- backend API route work;
- provisioning executor work;
- Procore SDK/API/secrets/runtime/write-back/mirror;
- workflow module execution;
- approval execution;
- Site Health scan or repair execution.

## Required Design Boundary

PCC must use the basis-of-design image at:

```text
docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png
```

PCC must not reuse the homepage paired-row layout as its core Project Home dashboard model. PCC must use a flexible bento/masonry-style layout with variable card spans and heights.

## Validation Baseline

Prompt-specific validation should prefer package-filtered commands where possible. At minimum, closeout should record:

```bash
git status --short
pnpm --filter @hbc/models test
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/spfx check-types || true
pnpm --filter @hbc/spfx test || true
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center lint
pnpm --filter @hbc/spfx-project-control-center test
```

If package names differ after scaffold, the agent must update commands to match actual repo truth and document the change.
