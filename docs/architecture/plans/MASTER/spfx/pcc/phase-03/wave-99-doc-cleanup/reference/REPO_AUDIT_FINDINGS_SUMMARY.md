# Repo Audit Findings Summary

This file summarizes the audit findings that the local code agent must preserve when making documentation updates.

## Core Finding

PCC is already directionally defined as a unified project operating layer, but the architecture documentation needs stronger doctrine to prevent future drift into department-specific workspaces or siloed module apps.

## Findings to Preserve

1. PCC should be one unified project shell.
2. Work centers should organize governed capabilities, not create departmental apps.
3. Workflow modules should be structured task/control patterns within PCC.
4. Role, stage, and task lenses should change user context without forking the project experience.
5. Source-of-record boundaries are strong and must be preserved.
6. Source lineage and evidence links are foundational.
7. Project lifecycle stages and readiness gates exist, but a first-class lifecycle spine should be documented.
8. Project memory, decision lineage, assumption lineage, and company knowledge reuse are not yet explicit enough.
9. Cross-stage traceability is not yet first-class but is required for warranty, estimating feedback, and lessons learned.
10. Closed-project knowledge reuse must be governed, permissioned, and searchable in later phases.
11. HBI must be grounded in evidence and must not become a source of truth.
12. Constraints Log and Buyout Log need clarified doctrine for primary governance vs Project Readiness signal rollup.
13. The target architecture blueprint contains stale phase-status posture and should defer status truth to roadmap/closeout docs.
14. Preconstruction continuity should preserve estimating assumptions, exclusions, inclusions, pricing rationale, bid strategy, and handoff context for operations.
15. Operations, closeout, warranty, and lessons learned should feed authorized future estimating and pursuit reference workflows.

## Patterns to Preserve

- One governed PCC shell.
- Project-first navigation and identity.
- Strict system-of-record boundaries.
- Source lineage and evidence-link discipline.
- Backend-mediated integrations.
- Launch-before-sync posture for external systems.
- No direct SPFx-to-Procore.
- No uncontrolled SharePoint edit dependency.
- Work center / surface / workflow module separation.
- ProjectStage and ProjectStatus separation.
- Anti-fork template rule.

## Patterns to Revise

- Make role/stage lenses first-class architecture.
- Make lifecycle spine first-class architecture.
- Make project memory first-class architecture.
- Define cross-stage traceability.
- Define closed-project knowledge reuse.
- Define warranty traceability.
- Define unified search and HBI grounding.
- Refresh stale blueprint status language.
- Clarify Project Readiness signal rollups for modules governed elsewhere.

## Do Not Change in This Package

- Runtime code.
- Model code.
- SPFx components.
- Backend routes.
- Fixtures.
- Package manifests.
- Lockfile.
- Tests, except running validation.
