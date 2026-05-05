# 08 — Risk, Decision, and Deferment Log

## Decisions

| ID | Decision | Rationale |
|---|---|---|
| C-D01 | Preserve `PccSurfaceContextHeader` as the shared primitive if it exists. | Repo truth shows Prompt 03 already added it and tests depend on it. |
| C-D02 | Treat current Wave C as hardening/normalization, not greenfield implementation. | Current commit includes cross-surface header implementation. |
| C-D03 | Do not add backend/API routes in Wave C. | The prompt scope is UI context/header standard, not data service expansion. |
| C-D04 | Use conservative source confidence labels unless model fields prove freshness. | Avoid misleading operators. |
| C-D05 | Preserve Wave B shell/nav ownership. | Prompt 02 already remediated shell/nav and later prompts depend on it. |

## Risks

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| C-R01 | Hard-coded project labels remain embedded in surface files. | Project identity can drift and look fake. | Centralize project context helper/view model. |
| C-R02 | Shell selectedProjectId remains unused. | Route changes may preserve only app identity, not selected project context. | Either wire selected project context or document explicit deferment. |
| C-R03 | Source confidence strings overstate live data. | Operator trust risk. | Use conservative labels and tests for fixture/reference/unavailable. |
| C-R04 | Context header becomes too dense in constrained width. | Host-fit and scan-path degradation. | Responsive CSS and screenshot matrix. |
| C-R05 | Heading hierarchy becomes noisy. | Accessibility and executive polish risk. | Add semantic/accessible-name tests and manual review. |
| C-R06 | Later Wave E state model changes conflict with Wave C fields. | Rework risk. | Keep fields narrow, documented, and typed. |

## Deferments

| ID | Deferment | Reason | Required future closure |
|---|---|---|---|
| C-F01 | Tenant-hosted SharePoint validation | Final validation wave owns tenant proof. | Prompt 09 / final Wave 15A evidence. |
| C-F02 | Live backend freshness | No backend/API scope in Wave C. | Future read-model implementation wave. |
| C-F03 | Full 56/56 claim | Wave C is one remediation wave only. | Final Wave H/Prompt 09 scorecard. |
| C-F04 | Broad surface redesign | Wave C is not a visual redesign wave. | Later surface remediation prompts if needed. |

## Open questions for local verification

1. Is the local branch exactly at or ahead of `a79d62155`?
2. Are Prompt 03 screenshot artifacts actually committed locally?
3. Does the dev harness allow non-home narrow route capture?
4. Does any current read model expose reliable `generatedAtUtc` for each surface?
5. Is there an existing project selector or profile resolver that should be used instead of a new local helper?
