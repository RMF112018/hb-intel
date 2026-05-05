# 07 — Risk, Decision, and Deferment Log

## Objective

Capture Wave B risks, closed decisions, and allowed deferments.

## Closed Decisions

| ID | Decision | Rationale |
| --- | --- | --- |
| WB-D-001 | Wave B uses the plans path package root: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-B-shell-host-navigation-remediation/`. | Matches attached prompt and keeps implementation prompts in MASTER plan path. |
| WB-D-002 | Blueprint evidence/closeout should be created under the Wave 15A blueprint path unless repo truth shows a newer convention. | Blueprint path is canonical product/architecture authority. |
| WB-D-003 | Navigation grouping starts with Command / Controls / Governance / Connected Systems. | Requested by controlling prompt and aligns with operational wayfinding. |
| WB-D-004 | Wave B cannot claim final 56/56. | Wave B is a foundational shared-shell remediation wave. |
| WB-D-005 | Search/command must be reduced or clearly scoped/inert. | Current source confirms desktop search is read-only/display-only. |

## Risks

| ID | Risk | Severity | Mitigation | Owner |
| --- | --- | --- | --- | --- |
| WB-R-001 | Tenant published/edit evidence may not be available during local execution. | High | Capture local SharePoint-like constrained screenshots and log tenant evidence gap; do not claim final closure. | Local agent / owner |
| WB-R-002 | Existing tests may depend on Wave 2 markers and flat nav. | Medium | Preserve stable markers where possible; update tests deliberately with closeout notes. | Local agent |
| WB-R-003 | Narrow mode currently hides nav list. | High | Add accessible disclosure/compact top-strip or prove alternate route access. | Local agent |
| WB-R-004 | Project context data may not exist in current read models. | Medium | Use transparent fixture-backed placeholders and log data contract gap for later wave. | Local agent |
| WB-R-005 | Host-fit changes may destabilize bento row-span behavior. | Medium | Run footprint tests and cross-surface smoke screenshots. | Local agent |
| WB-R-006 | Diagnostic language may be spread across surfaces. | Medium | Wave B centralizes shell-level status only; surface language remains later Wave E/F/G scope unless shell-blocking. | Local agent |

## Allowed Deferments

| ID | Deferment | Conditions |
| --- | --- | --- |
| WB-X-001 | Full surface content redesign | Allowed only because Wave B is shared shell/nav/host fit. Log blockers for later waves. |
| WB-X-002 | Live search implementation | Allowed because backend/API scope is prohibited. Must not leave misleading UI. |
| WB-X-003 | Live status/risk integration in nav | Allowed if current data is insufficient. Use neutral preview-safe cues. |
| WB-X-004 | Tenant screenshots | Allowed only as a documented evidence gap; final 56/56 remains blocked. |
