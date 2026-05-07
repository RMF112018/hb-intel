# PCC 100-Point UI/UX Scorecard Use Guide

**Document Status:** Procedure and application guide  
**Applies To:** Use of `PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`  
**Primary Audience:** Auditors, reviewers, designers, developers, and fresh-session analysis workflows  
**Companion Standard:** `PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`

---

## 1. Purpose

This guide explains how to apply the PCC 100-point UI/UX Mold Breaker Scorecard. It is intentionally separate from the scorecard itself.

The scorecard defines the standard. This guide defines how to use the standard.

Use this guide when:

- Conducting a repo-truth audit.
- Preparing a Phase 3 closeout score.
- Reviewing Phase 4 UI/UX readiness.
- Evaluating evidence completeness.
- Running an independent re-score.
- Preparing follow-on remediation planning.
- Structuring fresh-session audit work.

---

## 2. Use Principles

The scoring process must follow these principles:

1. **Repo truth first.** Do not rely on memory, assumptions, prior summaries, or undocumented intent.
2. **Evidence over opinion.** Every score must trace to evidence.
3. **Hard stops override totals.** A high score does not excuse a disqualifying issue.
4. **Mold Breaker criteria are mandatory.** PCC must be evaluated against both internal doctrine and external construction-tech differentiation goals.
5. **Source intent is not enough.** Accessibility, runtime, visual hierarchy, field fit, interaction, and breakpoint claims require appropriate proof.
6. **Separate confirmed from suspected.** Do not overstate visual or interaction issues without proof.
7. **Do not score missing evidence as success.** Unknown is not equivalent to passing.
8. **Phase 4 readiness must be explicit.** The final report must say whether PCC is ready, conditionally ready, or not ready.

---

## 3. Required Source Review

At minimum, an audit applying this scorecard should review:

### Governing Doctrine

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
- `docs/reference/ui-kit/doctrine/`
- `docs/reference/ui-kit/GOVERNANCE-MAP.md`
- `docs/reference/ui-kit/AGENT-USAGE-GUIDE.md`
- `docs/reference/ui-kit/standards/`
- `docs/reference/ui-kit/patterns/`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-evidence.md`

### Mold Breaker Design Decision Studies

- `docs/explanation/design-decisions/con-tech-ui-study.md`
- `docs/explanation/design-decisions/con-tech-ux-study.md`

### PCC Architecture and Source

- `docs/architecture/blueprint/sp-project-control-center/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/`
- `docs/architecture/plans/MASTER/spfx/pcc/`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/`
- `apps/project-control-center/`

---

## 4. Recommended Audit Sequence

1. Review governing doctrine and acceptance standards.
2. Review construction-tech UI/UX studies.
3. Build a current PCC surface inventory.
4. Review shared shell, navigation, bento, card, and state primitives.
5. Review each routed PCC surface.
6. Review evidence screenshots and tenant/runtime artifacts.
7. Apply the evidence matrix.
8. Identify hard-stop failures.
9. Score each pillar and subcategory.
10. Prepare category-by-category rationale.
11. Prepare evidence index.
12. Prepare open issues and exceptions log.
13. Issue final Phase 4 readiness statement.

---

## 5. Evidence Collection Rules

Each evidence item should include:

- Evidence ID.
- Evidence title.
- Source type.
- File path or screenshot path.
- Surface/system covered.
- Scorecard pillar(s) supported.
- Hard-stop gate(s) supported.
- Summary of what the evidence proves.
- Limitations or uncertainty.
- Whether evidence is sufficient for Phase 4.

### Recommended Evidence Record Format

```markdown
### EV-000 — Evidence Title

- **Evidence Type:** Source / Screenshot / Tenant Runtime / Test / Accessibility / Breakpoint / Content / State / Closure
- **Source Path:** `path/to/file`
- **Surface/System:** Project Home / Shell / Documents / etc.
- **Supports Pillars:** P1, P2, P4
- **Supports Hard Stops:** HS-02, HS-03
- **What It Proves:** ...
- **Limitations:** ...
- **Phase 4 Sufficiency:** Sufficient / Partial / Insufficient
```

---

## 6. Evidence Sufficiency Tiers

| Tier | Meaning | Use in Scoring |
|---|---|---|
| Tier 1 | Direct hosted runtime, screenshot, interaction, keyboard, breakpoint, or test proof | Strong evidence; supports full credit where applicable |
| Tier 2 | Source plus test proof | Strong for technical behavior, partial for visual/runtime claims |
| Tier 3 | Source-only proof | Useful but insufficient for visual, hosted, breakpoint, accessibility, or interaction full credit |
| Tier 4 | Screenshot-only proof | Useful for visual hierarchy, insufficient for source, accessibility, runtime, or interaction claims |
| Tier 5 | Inference or suspected issue | Should not receive full credit or be treated as confirmed |
| Invalid | Unsupported claim, memory, or undocumented assumption | Cannot support scoring |

---

## 7. Complete Evidence Checklist

The scorecard contains the summary evidence matrix. This section expands it into a detailed EV-001 through EV-134 checklist.

---

## A. Governing Doctrine Evidence

| ID | Evidence Item | Required For |
|---|---|---|
| EV-001 | UI doctrine source review evidence | Proves scoring is grounded in governing HB/SPFx standards. |
| EV-002 | Acceptance and scoring model review evidence | Proves the scorecard aligns with the official acceptance model. |
| EV-003 | SPFx host-governance evidence | Proves PCC respects SharePoint-hosted surface constraints. |
| EV-004 | UI-kit / design-token doctrine evidence | Proves visual and component decisions align with HB UI doctrine. |
| EV-005 | State-model doctrine evidence | Proves loading, empty, error, degraded, preview, and blocked states are judged against a standard. |
| EV-006 | Accessibility doctrine evidence | Proves accessibility is scored as a first-class requirement. |
| EV-007 | Breakpoint / container-fit doctrine evidence | Proves responsive scoring is not subjective. |
| EV-008 | Command-center / dashboard-pattern evidence | Proves PCC is evaluated as an operating layer, not just a card dashboard. |

---

## B. Mold Breaker / Construction-Tech Study Evidence

| ID | Evidence Item | Required For |
|---|---|---|
| EV-009 | Construction-tech UI study review evidence | Proves PCC is evaluated against incumbent platform UI patterns. |
| EV-010 | Construction-tech UX study review evidence | Proves PCC is evaluated against incumbent platform UX pain points. |
| EV-011 | Incumbent failure-mode comparison evidence | Proves PCC avoids dense navigation, cognitive overload, card/table overload, and field-office divergence. |
| EV-012 | Mold Breaker criteria mapping evidence | Proves each Mold Breaker strategy is mapped to scorecard categories. |
| EV-013 | Cognitive-load reduction evidence | Proves PCC lowers visual and operational burden compared with typical construction-tech platforms. |
| EV-014 | Progressive-disclosure evidence | Proves PCC does not expose all advanced detail at the same visual level. |
| EV-015 | Field-office continuity evidence | Proves PCC works across office and field use cases without separate mental models. |
| EV-016 | PWA-compatible / offline-aware UX posture evidence | Proves PCC does not contradict future offline/degraded/cached-state strategy. |
| EV-017 | HBI / command-intelligence differentiation evidence | Proves HBI reduces navigation and decision friction rather than acting as an add-on label. |

---

## C. Repo Source Evidence

| ID | Evidence Item | Required For |
|---|---|---|
| EV-018 | PCC app entry-point evidence | Confirms how PCC mounts and owns the SPFx canvas. |
| EV-019 | Shell source evidence | Confirms hero, navigation, active surface, layout, and host-fit behavior. |
| EV-020 | Surface router evidence | Confirms active-surface routing, fallback behavior, and panel ownership. |
| EV-021 | Project hero / identity source evidence | Confirms project context, active surface title, command/search, and metadata. |
| EV-022 | Navigation / tab source evidence | Confirms wayfinding, active state, keyboard support, and responsive behavior. |
| EV-023 | Bento grid source evidence | Confirms grid behavior, container handling, row/column logic, and direct-child contract. |
| EV-024 | Card primitive source evidence | Confirms hierarchy, tier, region, footprint, heading, ARIA, state, and action-slot behavior. |
| EV-025 | Shared state component evidence | Confirms loading, empty, error, blocked, degraded, preview, read-only, and unavailable states. |
| EV-026 | Surface source evidence — Project Home | Confirms first-impression command-center composition. |
| EV-027 | Surface source evidence — Project Readiness | Confirms readiness/workbench composition and information hierarchy. |
| EV-028 | Surface source evidence — Documents | Confirms Project Record / working files / external systems lane behavior. |
| EV-029 | Surface source evidence — External Platforms | Confirms launch-pad, registry, mapping, source-health, and read-only posture. |
| EV-030 | Surface source evidence — Approvals | Confirms queue, approvals, registry, policy, and disabled/read-only behavior. |
| EV-031 | Surface source evidence — Team & Access | Confirms role/persona visibility and access-request behavior. |
| EV-032 | Surface source evidence — Site Health | Confirms risk, drift, check, repair, and source-confidence behavior. |
| EV-033 | Surface source evidence — Settings | Confirms governance, inherited/locked/missing-config behavior. |
| EV-034 | Fixture / adapter / read-model evidence | Confirms what is mock, fixture, read-only, deferred, or live. |
| EV-035 | Test evidence | Confirms expected layout, routing, state, and accessibility behaviors are covered. |
| EV-036 | Manifest / package evidence | Confirms SPFx package identity and host-deployment assumptions. |

---

## D. Visual Evidence

| ID | Evidence Item | Required For |
|---|---|---|
| EV-037 | Full-page screenshot evidence for every PCC surface | Proves actual rendered hierarchy, density, and visual polish. |
| EV-038 | Above-the-fold screenshot evidence | Proves first-screen status, priority, and next-action clarity. |
| EV-039 | Full-scroll screenshot evidence | Proves lower-page content does not become a dense card wall. |
| EV-040 | Project Home screenshot evidence | Proves command-center entry quality. |
| EV-041 | Project Readiness screenshot evidence | Proves readiness/workbench hierarchy and overload risk. |
| EV-042 | Documents screenshot evidence | Proves source-of-record / working-file / external-system lane clarity. |
| EV-043 | External Platforms screenshot evidence | Proves launch-pad/read-only/mapping clarity. |
| EV-044 | Approvals screenshot evidence | Proves queue/workflow/read-only posture clarity. |
| EV-045 | Team & Access screenshot evidence | Proves role/access lane clarity. |
| EV-046 | Site Health screenshot evidence | Proves severity, owner, repair, drift, and next-step clarity. |
| EV-047 | Settings screenshot evidence | Proves governance, missing-config, locked/inherited, and admin ownership clarity. |
| EV-048 | Cross-surface visual consistency evidence | Proves surfaces feel like one product, not separate demos. |
| EV-049 | Card hierarchy screenshot evidence | Proves primary, secondary, supporting, state, and reference cards are visually distinct. |
| EV-050 | Status/severity screenshot evidence | Proves statuses are understandable and not color-only. |
| EV-051 | Empty/error/degraded visual evidence | Proves non-happy-path states render with appropriate clarity. |

---

## E. Tenant-Hosted / Runtime Evidence

| ID | Evidence Item | Required For |
|---|---|---|
| EV-052 | SharePoint-hosted runtime screenshot evidence | Proves PCC works inside the actual host, not just local dev. |
| EV-053 | SharePoint chrome boundary evidence | Proves PCC does not duplicate or fight the SharePoint shell. |
| EV-054 | Tenant-hosted console evidence | Proves no runtime errors, hydration failures, or layout exceptions. |
| EV-055 | Tenant-hosted navigation evidence | Proves tabs/surfaces work in the deployed package. |
| EV-056 | Tenant-hosted state rendering evidence | Proves fixture/read-model/degraded states work in actual host. |
| EV-057 | SharePoint edit-mode evidence | Proves authoring/edit-mode does not break the PCC canvas. |
| EV-058 | Package/version evidence | Proves screenshots correspond to the package being scored. |

---

## F. Responsive / Breakpoint / Container Evidence

| ID | Evidence Item | Required For |
|---|---|---|
| EV-059 | Desktop breakpoint evidence | Proves large-screen command-center layout. |
| EV-060 | Large laptop breakpoint evidence | Proves realistic executive/PM laptop usability. |
| EV-061 | Standard laptop breakpoint evidence | Proves dense operating view remains usable. |
| EV-062 | Small laptop breakpoint evidence | Proves constrained office-device behavior. |
| EV-063 | Tablet landscape evidence | Proves field tablet usability. |
| EV-064 | Tablet portrait evidence | Proves touch-first constrained layout. |
| EV-065 | Phone-width evidence | Proves graceful mobile degradation or clear non-supported posture. |
| EV-066 | Short-height viewport evidence | Proves command areas, cards, and scroll regions do not collapse. |
| EV-067 | High-zoom evidence | Proves usability at increased browser zoom. |
| EV-068 | Constrained SharePoint canvas evidence | Proves PCC works when host container width is reduced. |
| EV-069 | Overflow / clipping evidence | Proves no critical content is clipped, hidden, or horizontally unusable. |
| EV-070 | Bento direct-child / row-span visual evidence | Proves card heights and grid spans remain stable. |
| EV-071 | Touch-density evidence | Proves controls are usable on tablet/field devices. |

---

## G. Accessibility Evidence

| ID | Evidence Item | Required For |
|---|---|---|
| EV-072 | Keyboard navigation evidence | Proves all primary paths are keyboard reachable. |
| EV-073 | Focus order evidence | Proves logical movement through shell, tabs, cards, drawers, and actions. |
| EV-074 | Focus-visible evidence | Proves active keyboard focus is visible. |
| EV-075 | ARIA / semantic relationship evidence | Proves tabs, panels, headings, alerts, and state regions are semantically connected. |
| EV-076 | Screen-reader label evidence | Proves controls and regions have meaningful names. |
| EV-077 | Contrast evidence | Proves text, badges, states, and focus indicators meet accessibility expectations. |
| EV-078 | Color-independent status evidence | Proves status is communicated by text/icon/shape, not color alone. |
| EV-079 | Reduced-motion evidence | Proves animation does not create accessibility risk. |
| EV-080 | Hover-only behavior evidence | Proves no critical meaning depends only on hover. |
| EV-081 | Touch target evidence | Proves controls are large enough for tablet/field use. |
| EV-082 | Drawer / modal focus management evidence | Proves focus enters, traps where appropriate, and returns correctly. |

---

## H. Interaction / Workflow Evidence

| ID | Evidence Item | Required For |
|---|---|---|
| EV-083 | Primary-action clarity evidence | Proves the main action is obvious on each surface. |
| EV-084 | Priority-action evidence | Proves urgent work appears before reference content. |
| EV-085 | Disabled-control evidence | Proves disabled actions explain reason and next step. |
| EV-086 | Read-only workflow evidence | Proves non-executable workflows do not appear live. |
| EV-087 | Preview/deferred workflow evidence | Proves future-state features are clearly labeled and not misleading. |
| EV-088 | Launch/action behavior evidence | Proves launch-pad or external-system controls behave honestly. |
| EV-089 | Queue/workflow behavior evidence | Proves approvals/checkpoints queues do not imply unavailable execution. |
| EV-090 | Command/search/HBI behavior evidence | Proves command intelligence helps reduce navigation burden. |
| EV-091 | Navigation path evidence | Proves users can move from status to action without module hunting. |
| EV-092 | Cross-module relationship evidence | Proves lifecycle continuity across Documents, Readiness, Approvals, Site Health, External Platforms, and Project Home. |
| EV-093 | Responsibility / owner evidence | Proves users can identify who owns the issue, action, or next step. |

---

## I. State Model / Data Confidence Evidence

| ID | Evidence Item | Required For |
|---|---|---|
| EV-094 | Loading state evidence | Proves loading state is clear and not visually broken. |
| EV-095 | Empty state evidence | Proves empty state explains meaning and next step. |
| EV-096 | Error state evidence | Proves error state is actionable and recoverable. |
| EV-097 | Blocked state evidence | Proves blocked conditions identify cause and owner. |
| EV-098 | Degraded state evidence | Proves degraded data/functionality is clearly communicated. |
| EV-099 | Preview state evidence | Proves preview content does not look production-live. |
| EV-100 | Read-only state evidence | Proves read-only limitations are unmistakable. |
| EV-101 | Deferred state evidence | Proves future-scope content is clearly marked. |
| EV-102 | Unauthorized / no-access state evidence | Proves permission limits are clear and non-punitive. |
| EV-103 | Missing-configuration state evidence | Proves setup gaps explain owner and next action. |
| EV-104 | Stale-data / freshness evidence | Proves data recency or confidence is visible where relevant. |
| EV-105 | Source-of-record evidence | Proves users understand whether PCC, Procore, SharePoint, Sage, or another system owns the record. |
| EV-106 | Mock / fixture / demo-data evidence | Proves demo or fixture state is not mistaken for live integration. |

---

## J. Content / Language Evidence

| ID | Evidence Item | Required For |
|---|---|---|
| EV-107 | Construction-specific language evidence | Proves labels and headings match construction operations. |
| EV-108 | Executive-readable summary evidence | Proves high-level users can understand status without technical decoding. |
| EV-109 | PM / field-user clarity evidence | Proves operational users can identify work, owner, and next step. |
| EV-110 | State copy evidence | Proves non-happy-path messages explain condition, impact, owner, and next step. |
| EV-111 | Microcopy consistency evidence | Proves terms like read-only, preview, deferred, degraded, unavailable, and missing config are used consistently. |
| EV-112 | Source-confidence language evidence | Proves system seams are explained without exposing unnecessary plumbing. |
| EV-113 | HBI authority boundary language evidence | Proves HBI does not appear to approve, reject, commit, or mutate records beyond scope. |
| EV-114 | Avoidance of generic SaaS language evidence | Proves PCC does not rely on vague labels like “insights,” “overview,” or “activity” without operational meaning. |

---

## K. Scoring / Audit Closure Evidence

| ID | Evidence Item | Required For |
|---|---|---|
| EV-115 | Completed 100-point scorecard | Proves final score was calculated. |
| EV-116 | Category-by-category rationale | Proves each score is justified. |
| EV-117 | Subcategory score detail | Proves weighted points were assigned consistently. |
| EV-118 | Hard-stop checklist | Proves no disqualifying failure remains. |
| EV-119 | Evidence index | Proves all evidence is traceable. |
| EV-120 | Open issues / exceptions log | Proves residual issues are visible and classified. |
| EV-121 | Confirmed vs. suspected findings list | Proves uncertainty is not overstated. |
| EV-122 | Phase 4 readiness statement | Proves whether PCC is allowed to proceed. |
| EV-123 | Independent re-score evidence | Proves the score can be reproduced by a separate audit session. |
| EV-124 | Final package/version alignment evidence | Proves audit score matches the actual package entering Phase 4. |

---

## L. Surface-Specific Minimum Evidence Set

| ID | Evidence Item | Required For |
|---|---|---|
| EV-125 | Project Home evidence block | Screenshot, source, state, breakpoint, action, and accessibility evidence. |
| EV-126 | Project Readiness evidence block | Screenshot, source, decomposition, overload, state, and action evidence. |
| EV-127 | Documents evidence block | Lane clarity, source-of-record, permission, review, and empty-state evidence. |
| EV-128 | External Platforms evidence block | Launch/read-only, mapping, registry, source health, drawer, and false-affordance evidence. |
| EV-129 | Approvals evidence block | Queue, read-only workflow, disabled action, policy, registry, and HBI-boundary evidence. |
| EV-130 | Team & Access evidence block | Role/persona, request, manager, unauthorized, and permission-state evidence. |
| EV-131 | Site Health evidence block | Severity, drift, repair, source confidence, and degraded-state evidence. |
| EV-132 | Settings evidence block | Governance scope, missing config, inherited/locked state, and admin ownership evidence. |
| EV-133 | Shell / navigation evidence block | Hero, tabs, active state, command/search, project context, host fit, keyboard evidence. |
| EV-134 | Shared primitive evidence block | Bento, card, state, tab, hero, drawer, button, status, and typography evidence. |

---

## 8. Evidence File Organization Recommendation

Recommended evidence folder structure:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/evidence/
  scorecard/
    PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
    PCC_100_Point_UIUX_Scorecard_Use_Guide.md
    final-score-report.md
    hard-stop-checklist.md
    evidence-index.md
  screenshots/
    project-home/
    project-readiness/
    documents/
    external-platforms/
    approvals/
    team-access/
    site-health/
    settings/
    shell-navigation/
  breakpoint/
    desktop/
    large-laptop/
    standard-laptop/
    small-laptop/
    tablet-landscape/
    tablet-portrait/
    phone/
    high-zoom/
    short-height/
    constrained-sharepoint/
  accessibility/
    keyboard/
    focus/
    contrast/
    aria/
    touch-targets/
  runtime/
    tenant-hosted/
    console/
    package-version/
  source-review/
    doctrine/
    mold-breaker-studies/
    pcc-source/
    tests/
```

---

## 9. Screenshot Naming Convention

Use a consistent screenshot naming convention:

```text
{surface}_{viewport-or-state}_{YYYY-MM-DD}_{package-or-commit}.png
```

Examples:

```text
project-home_desktop_2026-05-07_spfx-1.0.0.12.png
external-platforms_read-only-state_2026-05-07_spfx-1.0.0.12.png
project-readiness_tablet-landscape_2026-05-07_spfx-1.0.0.12.png
shell-navigation_keyboard-focus_2026-05-07_spfx-1.0.0.12.png
```

---

## 10. Scoring Procedure

For each pillar:

1. Read the full pillar definition.
2. Review every subcategory.
3. Gather supporting evidence.
4. Assign points for each subcategory.
5. Record evidence IDs.
6. Identify uncertainty.
7. Identify hard-stop implications.
8. Record remediation notes, if applicable.
9. Move to the next pillar.

### Scoring Rule

Do not award full credit unless evidence proves the standard. If the result is plausible but not proven, score partially and mark the evidence gap.

---

## 11. Handling Missing Evidence

| Evidence Condition | Scoring Treatment |
|---|---|
| Evidence exists and fully proves criterion | Full credit may be awarded |
| Evidence partially proves criterion | Partial credit only |
| Evidence is source-only but visual/runtime proof is required | Partial credit maximum |
| Evidence is screenshot-only but source/interaction proof is required | Partial credit maximum |
| Evidence is inferred | Do not award full credit |
| Evidence is missing | Score as deficient |
| Evidence contradicts claimed behavior | Score as failing and flag hard-stop if applicable |

---

## 12. Hard-Stop Review Procedure

Before issuing a final score:

1. Review each hard stop in the scorecard.
2. Mark each as Pass, Fail, or Not Applicable.
3. Cite evidence IDs.
4. For any Fail, determine whether Phase 4 is blocked.
5. If any Phase 4 blocking hard stop remains, do not call PCC Phase 4-ready even if the numeric score is high.

---

## 13. Final Audit Report Structure

Recommended final report structure:

```markdown
# PCC 100-Point UI/UX Scorecard Audit Report

## 1. Executive Summary
## 2. Audit Scope
## 3. Source Documents Reviewed
## 4. PCC Surface Inventory
## 5. Evidence Summary
## 6. 100-Point Score Summary
## 7. Pillar-by-Pillar Scoring
## 8. Mold Breaker Differentiation Findings
## 9. Hard-Stop Checklist
## 10. Surface-Specific Findings
## 11. Accessibility and Breakpoint Findings
## 12. State Model and Source Confidence Findings
## 13. Open Issues / Exceptions
## 14. Phase 4 Readiness Statement
## 15. Evidence Index
```

---

## 14. Fresh-Session Use

When using this scorecard in a fresh GPT session, the session should be instructed to:

- Treat the scorecard as the governing standard.
- Treat this use guide as the application procedure.
- Inspect repo truth.
- Review the required source documents.
- Gather or review evidence.
- Score each category.
- Identify hard stops.
- Separate confirmed from suspected findings.
- Do not implement changes unless explicitly instructed.
- Produce a scoring report, not a remediation plan, unless specifically requested.

The fresh-session prompt itself should live outside the scorecard file.

---

## 15. Remediation Planning Use

After scoring is complete, remediation planning should:

- Start with hard stops.
- Then address the lowest-scoring pillars.
- Then address shared-system failures.
- Then address high-impact surfaces.
- Then address lower-risk polish.
- Preserve evidence IDs so final re-scoring can trace before/after results.

Recommended remediation priority order:

1. Hard-stop failures.
2. Shell, navigation, project context.
3. Bento/card hierarchy and density.
4. State model and false-affordance clarity.
5. Project Home.
6. Project Readiness.
7. External Platforms.
8. Approvals.
9. Documents.
10. Team & Access.
11. Site Health.
12. Settings.
13. Breakpoint/host-fit proof.
14. Accessibility proof.
15. Final independent re-score.

---

## 16. Final Readiness Statement Template

Use this format:

```markdown
## Phase 4 Readiness Statement

**Final Score:** __ / 100  
**Score Band:** [Flagship / Near Flagship / Professional / Baseline / Drift]  
**Hard Stops Remaining:** Yes / No  
**Minimum Pillar Threshold Met:** Yes / No  
**Evidence Package Complete:** Yes / No  
**Phase 4 Recommendation:** Ready / Conditionally Ready / Not Ready  

### Rationale

[Concise explanation]

### Blocking Issues

[List any blockers]

### Accepted Minor Exceptions

[List only non-critical, non-user-blocking exceptions]

### Required Next Action

[Direct recommendation]
```

---

## 17. Maintenance Notes

Update this use guide when:

- The scorecard changes.
- Evidence requirements change.
- Additional PCC surfaces become in scope.
- Phase 4 readiness criteria change.
- New doctrine references are added.
- Audit workflows or repo conventions change.
