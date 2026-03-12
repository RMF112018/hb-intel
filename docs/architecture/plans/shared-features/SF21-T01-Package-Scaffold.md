# SF21-T01 - Package Scaffold: `@hbc/features-project-hub` (Project Health Pulse)

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)  
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`  
**Decisions Applied:** D-01, D-10, D-14  
**Estimated Effort:** 0.5 sprint-weeks  
**Depends On:** SF21 master plan

> **Doc Classification:** Canonical Normative Plan - SF21-T01 scaffold task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Define SF21 scaffold under `@hbc/features-project-hub` with runtime/testing exports and explicit submodule boundaries for confidence, compound risk, explainability, governance, triage, and telemetry.

---

## Required Files

```text
packages/features/project-hub/
|- src/health-pulse/
|  |- types/index.ts
|  |- computors/index.ts
|  |- computors/confidence/index.ts
|  |- computors/compound-risk/index.ts
|  |- computors/recommendation/index.ts
|  |- computors/office-suppression/index.ts
|  |- governance/index.ts
|  |- telemetry/index.ts
|  |- hooks/index.ts
|  |- components/index.ts
|- testing/index.ts
|- src/__tests__/setup.ts
```

---

## Package Contract Requirements

- package name remains `@hbc/features-project-hub`
- export map includes runtime `./` and testing `./testing`
- testing entrypoint excluded from production bundle
- coverage thresholds are `95/95/95/95`
- scripts include check-types/build/test targets and task-focused test subsets
- scaffold notes must state that confidence/compound/recommendation/governance logic is not UI-only behavior

---

## README Requirement (Mandatory in T01)

**File:** `packages/features/project-hub/README.md`

Must include:

1. pulse overview and value proposition
2. confidence + compound-risk + explainability architecture summary
3. top recommended action prioritization model summary
4. manual-entry governance and Office suppression policy summary
5. portfolio triage mode summary
6. exports table (runtime and testing)
7. boundary rules and telemetry emission notes
8. links to SF21 master, T09, ADR-0110

---

## Verification Commands

```bash
pnpm --filter @hbc/features-project-hub check-types
pnpm --filter @hbc/features-project-hub build
pnpm --filter @hbc/features-project-hub test --coverage
test -f packages/features/project-hub/README.md
```
