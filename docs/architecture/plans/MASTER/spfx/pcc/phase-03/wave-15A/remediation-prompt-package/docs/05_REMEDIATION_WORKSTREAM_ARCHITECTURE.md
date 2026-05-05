# 05 — Remediation Workstream Architecture

## Purpose

Define the ordered Wave 15A remediation architecture.

## Workstreams

| Workstream                                                  | Objective                                                                                             | Explicit Non-Scope                                   | Dependency                       | Expected Scorecard Impact                                 |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------- | --------------------------------------------------------- |
| Wave A — Baseline and Doctrine Contract                     | Place docs, establish scorecard contract, evidence plan, and scope lock.                              | No runtime UI changes.                               | Required before any remediation. | Creates baseline; no score improvement claim.             |
| Wave B — Shell, Host Fit, and Navigation                    | Remediate shell dominance, host fit, and nav IA.                                                      | No surface content redesign beyond shell/nav seams.  | Depends on Wave A.               | Improves shell/host/nav categories.                       |
| Wave C — Project Context and Surface Header Standard        | Create consistent project context and surface header contract.                                        | No deep card-grid changes except header integration. | Depends on Wave B.               | Improves project context/surface composition.             |
| Wave D — Grid, Bento, Card Hierarchy, and Layout Primitives | Stabilize grid/card hierarchy and responsive/container behavior.                                      | No one-off per-surface hacks.                        | Depends on Wave C.               | Improves layout/card/responsive categories.               |
| Wave E — State Model and Product Language                   | Standardize preview/read-only/degraded/disabled copy and states.                                      | No backend/API changes.                              | Depends on Wave D.               | Improves state/copy/interaction categories.               |
| Wave F — First-Impression Surfaces                          | Remediate Project Home, Team & Access, Documents, Project Readiness.                                  | No governance/integration surface scope.             | Depends on Wave E.               | Improves first-use confidence and surface quality.        |
| Wave G — Governance, Risk, and Integration Surfaces         | Remediate Site Health, Control Center Settings, Approvals, External Systems.                          | No backend/API feature expansion.                    | Depends on Wave F.               | Improves governance/integration/risk surfaces.            |
| Wave H — Tenant Validation and 56/56 Closeout               | Build validation evidence, final screenshots, keyboard/a11y checks, tenant proof, scorecard closeout. | No new remediation unless defects block closeout.    | Depends on Waves B-G completion. | Only wave allowed to claim 56/56 if evidence supports it. |

## Execution Principles

- Shared/systemic issues must be fixed before surface-level visual fixes.
- Shell/nav/context/layout/state patterns must be centralized, not copied locally.
- Surface remediation must use shared primitives unless repo truth proves a justified exception.
- Each wave must produce evidence and closeout docs.
- Wave H is the only wave allowed to claim 56/56, and only if evidence supports it.

## Workstream Dependency Logic

1. Wave A establishes authority and prevents subjective redesign.
2. Wave B makes the shell and navigation usable inside SharePoint.
3. Wave C gives every surface the same project context contract.
4. Wave D prevents grid/card collapse and flat hierarchy.
5. Wave E prevents developer-facing/no-data/disabled-control language.
6. Wave F remediates first-impression surfaces after shared patterns exist.
7. Wave G remediates governance/integration/risk surfaces after shared and first-impression patterns exist.
8. Wave H validates the entire product in the actual SharePoint tenant.
