# 06 — Shell Continuity and Specialization Guidance

**Status:** Complete
**Full review:** [accounting-vs-project-setup-shell-continuity-review.md](../../../../reviews/accounting-vs-project-setup-shell-continuity-review.md)

## Verdict

**No drift found.** All differences between Accounting and Estimating shell behaviors are justified domain specializations. Both apps feel like one HB Intel application family built on shared infrastructure.

## Shared Foundation

Both apps use: `ShellLayout` (simplified), `WorkspacePageShell`, `HbcErrorBoundary`, `ComplexityProvider`, `showBackToProjectHub`, breadcrumbs on detail pages, session guards, load-error states, and memory routers.

## Governed Specializations

| # | Difference | Accounting | Estimating | Classification |
|---|-----------|-----------|-----------|----------------|
| S1 | Workspace label + tool picker | "Accounting" + 4 nav items | Empty + none | Multi-view vs single-workflow |
| S2 | Backend mode switch + banners | Absent | Present | Accounting always uses real API |
| S3 | Session state + draft persistence | Absent | Present | No long-form data entry in Accounting |
| S4 | SignalR real-time updates | Absent | Present | No workflow-progression tracking |
| S5 | Toast notifications | Present | Absent | Different feedback patterns |
| S6 | Theme forcing | Default | Force light in SPFx | Acceptable caveat — no current impact |
| S7 | Initial route | `/` (Overview) | `/project-setup` (List) | Domain-appropriate landing |

## What Later Prompts Can Assume

1. Shell continuity is confirmed — no remediation needed.
2. All differences are governed as intentional specialization.
3. The theme-forcing difference (S6) is documented but not corrected — revisit only if SharePoint theme environment changes.
4. Future Accounting features should use the same shell components (`WorkspacePageShell`, `HbcComplexityGate`, breadcrumbs) to maintain continuity.
