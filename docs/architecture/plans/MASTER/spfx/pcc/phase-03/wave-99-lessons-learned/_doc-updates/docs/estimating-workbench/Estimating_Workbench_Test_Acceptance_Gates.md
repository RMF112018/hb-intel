# Estimating Workbench Test and Acceptance Gates
## Wave 13G Authority Lock

All Estimating Workbench documentation, UX/wireframe framing, dependency evaluation, model contracts, SharePoint schema contracts, SPFx surface contracts, read-model/command contracts, test gates, and subsequent runtime implementation prompts are governed under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/
```

The wireframe authority path is:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/wireframes/
```

The developer-contract target path is:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/
```

This Wave 13G authority supersedes any earlier implication that Estimating Workbench implementation work should move to a separate future wave. Future implementation may be split into 13G sub-prompts or phases, but it remains under Wave 13G unless a later approved architecture decision explicitly supersedes this path.

Wave 13G documentation and prompts do not, by themselves, authorize production rollout, tenant mutation, package installation, lockfile mutation, Procore/Sage writeback, or active project workbook import.

```json
{
  "validationCommands": [
    "git status --short",
    "git branch --show-current",
    "git rev-parse HEAD",
    "git log --oneline -12",
    "md5 pnpm-lock.yaml",
    "git diff --check",
    "pnpm exec prettier --check <touched markdown/json files>",
    "python3 -m json.tool <each touched json file>"
  ],
  "acceptanceGates": [
    "documentation-only no runtime changes",
    "all JSON valid",
    "all new docs cross-referenced",
    "no package or lockfile changes",
    "MVP scope lock reflected in registers/roadmap",
    "dependency evaluation documented but not installed",
    "no tenant/source-system mutation",
    "no HBI pricing/award authority"
  ]
}
```
