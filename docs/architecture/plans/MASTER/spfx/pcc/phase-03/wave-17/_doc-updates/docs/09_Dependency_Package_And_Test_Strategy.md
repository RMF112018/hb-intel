# 09 — Dependency Package and Test Strategy

## Dependency Posture

This documentation package does not authorize dependency or lockfile changes.

Future implementation may evaluate packages already present in the repo first. New dependencies require explicit future approval, package-review notes, and lockfile MD5 evidence.

## Candidate Dependency Evaluation

| Candidate | Purpose | Default Decision |
|---|---|---|
| Existing Fluent UI / SPFx controls | Microsoft-aligned UI components | Prefer if already installed |
| Existing Testing Library / Vitest | Component and contract testing | Use existing stack |
| Existing repo accessibility tooling | A11y checks | Use if present |
| TanStack Table | Large queue tables | Evaluate only if already installed or explicitly approved |
| TanStack Virtual | Long queue virtualization | Evaluate only for large datasets and explicit approval |
| Zod or AJV | Runtime schema validation | Prefer existing repo validation conventions |
| XState | Workflow lifecycle | Do not add unless future workflow complexity justifies it |
| axe-core | Accessibility checks | Use only if compatible and approved |

## Required Test Matrix

| Area | Test Requirement |
|---|---|
| Models | Type unions for categories, statuses, severities, action modes |
| Fixtures | Deterministic healthy, degraded, stale, unknown project, backend unavailable scenarios |
| Backend provider | GET-only route methods return envelopes and warnings |
| Route registry | Route IDs and paths match client methods |
| SPFx backend client | No POST/PUT/PATCH/DELETE, no viewerPersona serialization |
| Fixture client | Known, unknown, backend-unavailable behavior for every method |
| Surface adapter | Converts read models into view models with redaction |
| Findings queue | Filters, sort, pagination, empty states |
| Drawers | Open/close/focus restore, evidence rendering |
| Redaction | Persona-specific sensitive detail behavior |
| HBI | Allowed/refused prompts and evidence citation |
| Priority Actions | Candidate derivation and deduplication |
| Wave 14 handoff | Checkpoint candidate object shape |
| No mutation | Static search for prohibited Graph/PnP/SharePoint write imports and methods |

## Validation Commands

Documentation prompts must run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
pnpm exec prettier --check <touched markdown/json files>
find <wave-17-package-path> -name "*.json" -print0 | xargs -0 -n1 python3 -m json.tool >/dev/null
rg -n "TB[D]|TO[D]O|Open decisio[n]|PLACEHOLDE[R]" <wave-17-package-path>
git diff --name-only
git diff --cached --name-only
```

Future runtime implementation prompts may add targeted commands only after repo-truth verification, such as:

```bash
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/backend-functions test
```
