# Estimating Workbench Implementation Roadmap Update
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

## Documentation Package Phase

1. Repo truth revalidation.
2. Governing docs/register alignment.
3. Target architecture and MVP scope lock.
4. Developer contracts and reference JSONs.
5. Template, cost-code, migration, and handoff contracts.
6. Dependency evaluation and test gates.
7. Closeout validation.

## Wave 13G Runtime Implementation Phases

All phases below remain under the single Wave 13G authority path. They may be executed as separate 13G sub-prompts, but they are not separate future waves.

1. **13G-A — Authority, repo truth, and scope lock.**
2. **13G-B — Governing docs/register alignment and MVP amendment.**
3. **13G-C — Developer contracts and machine-readable reference artifacts.**
4. **13G-D — Model contracts and fixtures in `@hbc/models/pcc`.**
5. **13G-E — SharePoint schema dry-run/provisioning proof in non-production only.**
6. **13G-F — SPFx read-only surface prototype under Project Readiness.**
7. **13G-G — Estimate Builder grid prototype with fixture-backed data.**
8. **13G-H — Commercial/Multifamily template seed implementation.**
9. **13G-I — Bid Leveling Workbench implementation.**
10. **13G-J — Handoff Preview, snapshot, export, and freeze proof.**
11. **13G-K — Hosted SPFx visual validation in controlled non-production scope.**
12. **13G-L — Pilot readiness gate and closeout.**

## Production Block

No production rollout is authorized by documentation acceptance.
