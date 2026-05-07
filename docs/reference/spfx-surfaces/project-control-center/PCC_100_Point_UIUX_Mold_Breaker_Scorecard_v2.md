# PCC 100-Point UI/UX Mold Breaker Scorecard

**Document Status:** Governing evaluation standard  
**Applies To:** HB Intel Project Control Center (PCC) UI/UX readiness scoring  
**Primary Gate:** PCC Phase 3 closeout and Phase 4 entry readiness  
**Scoring Model:** Weighted 100-point standard with hard-stop gates  
**Companion Procedure:** `PCC_100_Point_UIUX_Scorecard_Use_Guide.md`

---

## 1. Purpose

This scorecard defines the governing UI/UX acceptance standard for the HB Intel Project Control Center (PCC). It replaces the prior 56-point equal-weight scoring model with a clearer weighted 100-point model that evaluates:

1. Internal HB/SPFx UI doctrine conformance.
2. PCC command-center quality.
3. Construction-specific operational clarity.
4. Differentiation from incumbent construction-technology UX/UI failure modes.
5. Evidence-backed readiness for Phase 4 tenant validation.

This document is the scoring standard only. It does not prescribe how to run a fresh-session audit, how to generate remediation prompts, or how to instruct a local code agent. Those procedures belong in the companion use guide.

---

## 2. Required Source References

This scorecard is grounded in the following repository references and should be maintained in alignment with them:

- `docs/explanation/design-decisions/con-tech-ui-study.md`
- `docs/explanation/design-decisions/con-tech-ux-study.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

Additional supporting references may include:

- `docs/reference/ui-kit/doctrine/`
- `docs/reference/ui-kit/GOVERNANCE-MAP.md`
- `docs/reference/ui-kit/AGENT-USAGE-GUIDE.md`
- `docs/reference/ui-kit/standards/`
- `docs/reference/ui-kit/patterns/`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-evidence.md`
- `docs/architecture/blueprint/sp-project-control-center/`
- `docs/architecture/plans/MASTER/spfx/pcc/`
- `apps/project-control-center/`

---

## 3. Scoring Philosophy

The PCC score must measure more than whether the interface is visually clean or technically compliant. The score must determine whether PCC is an excellent, construction-specific project control interface that avoids repeating known frustrations from leading construction platforms.

A high score requires the PCC UI/UX to:

- Respect SharePoint-hosted SPFx constraints.
- Use HB UI doctrine and reusable primitives correctly.
- Establish a strong project control center identity.
- Reduce cognitive load.
- Provide clear operational hierarchy.
- Make priority work and next actions obvious.
- Avoid dense module-heavy navigation as the primary user mental model.
- Avoid equal-weight card walls.
- Distinguish live, preview, read-only, deferred, degraded, unavailable, stale, mock, and source-owned conditions.
- Support field-office continuity.
- Maintain accessibility, breakpoint, touch, and host-runtime quality.
- Provide reproducible evidence for every score.

---

## 4. Phase 4 Readiness Rule

PCC should not enter Phase 4 tenant validation unless all of the following are true:

- Final score is **95/100 or higher**.
- No hard-stop gate remains open.
- No pillar scores below **80%** of available points.
- No unresolved critical visual, interaction, state, accessibility, host-fit, or evidence gaps remain.
- Evidence package is complete enough for independent re-scoring.
- Any residual items are non-critical, non-user-blocking, documented, and explicitly accepted by leadership.

**Target score:** 100/100  
**Minimum score for Phase 4 entry consideration:** 95/100, with no hard stops

A score below 95/100 means PCC is not ready to carry a flagship UI/UX posture into Phase 4.

---

## 5. Score Bands

| Score | Meaning | Phase 4 Readiness |
|---:|---|---|
| 100 | Fully flagship, fully evidence-backed | Ready, if no hard stops |
| 95–99 | Flagship-ready with only minor non-blocking evidence or polish gaps | Conditionally ready, if no hard stops |
| 90–94 | Near flagship | Not ready under the current Phase 4 goal |
| 80–89 | Professional but not flagship | Not ready |
| 70–79 | Usable baseline with material doctrine/product gaps | Not ready |
| Below 70 | Significant UI/UX drift | Not ready |

---

## 6. Weighted 100-Point Scorecard Summary

| Pillar | Weight | Purpose |
|---|---:|---|
| 1. PCC Product Strategy and Command-Center Clarity | 15 | Confirms PCC feels like a purpose-built project control center. |
| 2. Construction-Tech Mold Breaker Differentiation | 20 | Confirms PCC avoids known incumbent construction-tech UX/UI pain points. |
| 3. Shell, Navigation, and Project Context | 12 | Confirms the shared frame orients the user and reduces navigation burden. |
| 4. Layout, Bento, Card Hierarchy, and Density | 12 | Confirms the UI guides attention instead of producing a card wall. |
| 5. Workflow, Interaction, and Next-Action Clarity | 12 | Confirms users know what to do next without hunting through modules. |
| 6. State Model, Read-Only, Preview, Degraded, and Source Confidence | 10 | Confirms states are honest, actionable, and trust-building. |
| 7. Responsive, Field, Touch, and Host-Fit Behavior | 8 | Confirms PCC works in SharePoint-hosted, laptop, tablet, field, and constrained contexts. |
| 8. Accessibility, Visual Semantics, and Inclusive Use | 6 | Confirms accessibility is treated as a product advantage. |
| 9. Evidence, Validation, and Phase 4 Readiness | 5 | Confirms the final score is reproducible and evidence-backed. |
| **Total** | **100** |  |

---

## 7. Pillar 1 — PCC Product Strategy and Command-Center Clarity — 15 Points

### Scoring Criteria

| Subcategory | Points | Full-Credit Standard |
|---|---:|---|
| Project control center identity | 3 | PCC is immediately recognizable as a project control center, not a generic dashboard, SharePoint landing page, or disconnected module collection. |
| Status, risk, and priority clarity | 4 | Users can identify current project status, risk posture, and priority work quickly without interpreting multiple unrelated cards. |
| Project Home operating-layer quality | 3 | Project Home acts as the operating layer for project control, not a simple index or summary dashboard. |
| Lifecycle continuity | 3 | Surfaces reinforce one connected project lifecycle model across readiness, documents, approvals, site health, external systems, and settings. |
| Construction-specific language | 2 | Labels, headings, and summaries use construction operations language that makes ownership, risk, exposure, and action clear. |

### Full-Credit Evidence

- Project Home screenshot evidence.
- Shell/hero source evidence.
- Cross-surface screenshot evidence.
- Content review evidence.
- Surface source evidence.
- Evidence that command-center hierarchy is visible above the fold.

### Zero-Credit / Hard-Stop Conditions

- PCC reads as a generic card dashboard.
- Users cannot determine project condition or priority work quickly.
- Surfaces feel like independent demos rather than one product.
- Project Home functions mainly as navigation tiles or passive summaries.

---

## 8. Pillar 2 — Construction-Tech Mold Breaker Differentiation — 20 Points

### Scoring Criteria

| Subcategory | Points | Full-Credit Standard |
|---|---:|---|
| Cognitive-load reduction | 4 | PCC meaningfully reduces visual and operational burden compared with incumbent construction platforms. |
| Avoidance of dense module navigation | 3 | PCC does not rely primarily on dense module switching or learned navigation paths to complete common work. |
| Progressive disclosure | 3 | Advanced or secondary detail is subordinated until needed; users are not forced to parse everything at once. |
| Field-office continuity | 3 | PCC maintains one coherent mental model across desktop, laptop, tablet, touch, and constrained SharePoint contexts. |
| Responsibility, urgency, and next action | 3 | PCC makes owner, urgency, and next action clearer than typical incumbent construction systems. |
| PWA-compatible / offline-aware posture | 2 | PCC’s UX model does not contradict future offline, cached, degraded, or installable operating concepts where applicable. |
| HBI / command intelligence differentiation | 2 | HBI or command/search behavior reduces navigation and decision friction instead of appearing as a decorative add-on. |

### Mold Breaker Intent

The attached construction-tech UI/UX studies identify a category-wide convergence around three-region shells, dashboards, cards, tables, status badges, toolbars, and dense enterprise workflows. They also identify persistent pain points: steep learning curves, cognitive overload, dense web views, field-office divergence, connectivity dependence, and reactive error handling. PCC receives full credit only when it improves on these incumbent patterns rather than merely reproducing them with better styling.

### Full-Credit Evidence

- Review evidence from `con-tech-ui-study.md`.
- Review evidence from `con-tech-ux-study.md`.
- Mold Breaker comparison evidence.
- Cognitive-load evidence.
- Progressive-disclosure evidence.
- Field-office continuity evidence.
- HBI/command-search evidence.
- PWA-compatible/degraded-state posture evidence.

### Zero-Credit / Hard-Stop Conditions

- PCC mimics dense incumbent construction-tech dashboards.
- PCC looks cleaner but still forces users to hunt through modules.
- PCC exposes too many equal-weight cards, tables, panes, badges, or signals.
- HBI is visible but does not reduce task friction.
- Field/tablet contexts produce a separate or degraded mental model.

---

## 9. Pillar 3 — Shell, Navigation, and Project Context — 12 Points

### Scoring Criteria

| Subcategory | Points | Full-Credit Standard |
|---|---:|---|
| SharePoint host boundary | 2 | PCC respects SharePoint chrome and page-canvas realities without duplicating the host shell. |
| Persistent project identity | 2 | Project identity remains clear and useful across surfaces. |
| Active surface clarity | 2 | Users always know where they are and what surface is active. |
| Work-center navigation | 3 | Navigation supports operational movement and priority work, not only module switching. |
| Command/search/HBI affordance | 2 | Command/search/HBI affordances help users bypass learned navigation burden. |
| Adaptive shell behavior | 1 | Shell does not crowd the working canvas and adapts to constrained contexts. |

### Full-Credit Evidence

- Shell source evidence.
- Project hero source and screenshot evidence.
- Navigation/tab source and screenshot evidence.
- Host-runtime evidence.
- Keyboard navigation evidence.
- Breakpoint evidence.

### Zero-Credit / Hard-Stop Conditions

- PCC competes with or duplicates SharePoint chrome.
- Active project or active surface is unclear.
- Navigation is accessible only visually but not operationally useful.
- Shell consumes excessive working space in field/tablet contexts.

---

## 10. Pillar 4 — Layout, Bento, Card Hierarchy, and Density — 12 Points

### Scoring Criteria

| Subcategory | Points | Full-Credit Standard |
|---|---:|---|
| Primary/secondary/supporting hierarchy | 3 | Layout clearly distinguishes primary operating content, supporting context, reference content, and state cards. |
| Equal-weight card wall prevention | 3 | Bento/card composition avoids dense uniform grids that require users to interpret every card equally. |
| Compact readable density | 2 | PCC achieves compact professional density without harming readability, touch usability, or scanability. |
| Predictable footprint behavior | 2 | Card spans, row spans, and footprints behave predictably across responsive modes. |
| Visual rhythm and grouping | 2 | Spacing, grouping, alignment, and visual rhythm support fast scanning and decision-making. |

### Full-Credit Evidence

- Bento grid source evidence.
- Card primitive source evidence.
- Full-page and full-scroll screenshots.
- Card hierarchy screenshots.
- Breakpoint and row-span visual evidence.
- Visual consistency evidence.

### Zero-Credit / Hard-Stop Conditions

- Surfaces collapse into card walls.
- Primary action cards do not read as primary.
- Supporting/reference cards compete with urgent work.
- Card height/span behavior breaks in hosted or constrained contexts.

---

## 11. Pillar 5 — Workflow, Interaction, and Next-Action Clarity — 12 Points

### Scoring Criteria

| Subcategory | Points | Full-Credit Standard |
|---|---:|---|
| Primary action clarity | 2 | Each surface makes the most important action or decision path obvious. |
| Priority before reference content | 2 | Priority work appears before logs, registries, passive summaries, or reference cards. |
| Disabled-action clarity | 2 | Disabled actions explain why they are disabled and what must happen next. |
| Read-only workflow honesty | 2 | Read-only workflows do not appear live, executable, or broken. |
| Status-to-action path | 2 | Users can move from project status to relevant action with minimal friction. |
| Low dependency on prior platform knowledge | 2 | Critical flows are understandable without prior familiarity with PCC internals or incumbent platform patterns. |

### Full-Credit Evidence

- Primary-action screenshot evidence.
- Disabled-control evidence.
- Read-only workflow evidence.
- Queue/workflow behavior evidence.
- Navigation path evidence.
- HBI/command evidence.
- Cross-module relationship evidence.

### Zero-Credit / Hard-Stop Conditions

- Buttons or controls appear executable but do not work.
- Users cannot tell what to do next.
- Priority actions are buried below passive content.
- Read-only previews look like failed live workflows.

---

## 12. Pillar 6 — State Model, Read-Only, Preview, Degraded, and Source Confidence — 10 Points

### Scoring Criteria

| Subcategory | Points | Full-Credit Standard |
|---|---:|---|
| Core state completeness | 2 | Loading, empty, error, blocked, degraded, preview, unavailable, unauthorized, stale, and read-only states are accounted for where applicable. |
| Preview/read-only/deferred clarity | 2 | Users can immediately distinguish preview, read-only, future-scope, unavailable, and live states. |
| State copy quality | 2 | State copy explains condition, impact, owner, and next step. |
| Source-of-record and data confidence | 2 | Users understand whether PCC, Procore, SharePoint, Sage, fixture data, or another system owns or supplies the record. |
| Offline/degraded posture compatibility | 2 | Current state language and architecture do not contradict future offline/cached/degraded-state strategy. |

### Full-Credit Evidence

- State component source evidence.
- State screenshot evidence.
- Fixture/read-model evidence.
- Source-of-record evidence.
- Mock/demo-data evidence.
- State copy evidence.
- HBI authority boundary language evidence.

### Zero-Credit / Hard-Stop Conditions

- Users cannot tell whether content is live, mock, read-only, stale, degraded, or deferred.
- Source ownership is ambiguous.
- Error/degraded states are visually present but not operationally meaningful.
- HBI appears to own or approve actions outside its authority.

---

## 13. Pillar 7 — Responsive, Field, Touch, and Host-Fit Behavior — 8 Points

### Scoring Criteria

| Subcategory | Points | Full-Credit Standard |
|---|---:|---|
| SharePoint-hosted canvas fit | 2 | PCC fits the tenant-hosted SharePoint canvas without clipping, fighting chrome, or relying on local-only assumptions. |
| Breakpoint usability | 2 | Desktop, laptop, tablet landscape, tablet portrait, phone-width or explicitly unsupported narrow contexts are handled. |
| Touch and field density | 2 | Controls, spacing, status cues, and card density are usable for tablet/field interaction. |
| Zoom, short-height, and constrained-container resilience | 2 | PCC remains usable at high zoom, short viewport height, and reduced host-container widths. |

### Full-Credit Evidence

- Tenant-hosted screenshots.
- Breakpoint screenshots.
- Touch-density evidence.
- High-zoom evidence.
- Short-height evidence.
- Overflow/clipping evidence.
- Bento row-span visual evidence.

### Zero-Credit / Hard-Stop Conditions

- Local dev looks acceptable but tenant-hosted runtime fails.
- Laptop/tablet layouts collapse or become unusable.
- High zoom or short-height conditions hide primary actions.
- Critical content requires horizontal scrolling in normal supported contexts.

---

## 14. Pillar 8 — Accessibility, Visual Semantics, and Inclusive Use — 6 Points

### Scoring Criteria

| Subcategory | Points | Full-Credit Standard |
|---|---:|---|
| Keyboard and focus path | 2 | Shell, navigation, cards, controls, drawers, and primary workflows are keyboard reachable with logical focus order. |
| Color-independent status | 1 | Status, urgency, and severity are communicated by text, icon, shape, or structure, not color alone. |
| Contrast and typography | 1 | Text, badges, states, focus indicators, and control labels are readable in normal office and field conditions. |
| ARIA, landmarks, labels, reduced motion | 1 | Semantic relationships, names, alerts, reduced-motion support, and accessible structure are validated. |
| No hover-only meaning | 1 | Critical information and actions do not depend only on hover. |

### Full-Credit Evidence

- Keyboard navigation evidence.
- Focus order evidence.
- Focus-visible evidence.
- ARIA/semantic evidence.
- Contrast evidence.
- Color-independent status evidence.
- Reduced-motion evidence.
- Touch target evidence.
- Drawer/modal focus evidence.

### Zero-Credit / Hard-Stop Conditions

- Primary navigation or actions are not keyboard reachable.
- Focus is invisible or illogical.
- Status relies on color alone.
- Critical meaning appears only on hover.
- Modal/drawer focus behavior traps or loses the user.

---

## 15. Pillar 9 — Evidence, Validation, and Phase 4 Readiness — 5 Points

### Scoring Criteria

| Subcategory | Points | Full-Credit Standard |
|---|---:|---|
| Evidence matrix completeness | 1 | Evidence matrix is complete, traceable, and mapped to scoring categories. |
| Screenshot coverage | 1 | Current screenshots cover all required surfaces, states, and breakpoints. |
| Source/test/runtime proof | 1 | Source, tests, tenant runtime, and package/version evidence are aligned. |
| Hard-stop checklist | 1 | Every hard-stop gate is explicitly passed or documented as blocking. |
| Independent reproducibility | 1 | A separate auditor can reproduce the score from the provided evidence. |

### Full-Credit Evidence

- Completed scorecard.
- Category-by-category rationale.
- Evidence index.
- Hard-stop checklist.
- Open issues/exceptions log.
- Confirmed vs. suspected findings list.
- Final package/version alignment evidence.
- Independent re-score evidence.

### Zero-Credit / Hard-Stop Conditions

- A score is claimed without evidence.
- Screenshots do not match the package being scored.
- Known hard stops are treated as minor issues.
- Independent scoring cannot reproduce the result.

---

## 16. Hard-Stop Failure Checklist

A hard-stop failure blocks Phase 4 entry regardless of total score.

| Hard Stop ID | Failure | Blocks Phase 4? |
|---|---|---|
| HS-01 | Incumbent mimicry failure: PCC reproduces dense, module-heavy construction-tech UX patterns without meaningful improvement. | Yes |
| HS-02 | Command-center failure: users cannot quickly identify status, risk, priority, and next action. | Yes |
| HS-03 | Cognitive-overload failure: too many equal-weight cards, panels, tables, states, or signals compete for attention. | Yes |
| HS-04 | False-affordance failure: read-only, preview, deferred, unavailable, or disabled controls appear live or executable. | Yes |
| HS-05 | Field-office divergence failure: PCC works as an office dashboard but materially degrades on tablet, touch, short-height, high-zoom, or constrained host contexts. | Yes |
| HS-06 | State-model failure: live, mock, read-only, stale, unavailable, degraded, deferred, unauthorized, and source-owned states are not distinguishable. | Yes |
| HS-07 | Accessibility failure: keyboard, focus, contrast, touch target, or semantic status issues block primary use. | Yes |
| HS-08 | SharePoint host-fit failure: PCC competes with SharePoint chrome or fails in hosted runtime. | Yes |
| HS-09 | Evidence failure: final score cannot be supported by source, visual, tenant, interaction, accessibility, and validation evidence. | Yes |
| HS-10 | HBI authority failure: HBI appears to approve, reject, commit, mutate, or certify records beyond its intended authority. | Yes |

---

## 17. Evidence Requirements Matrix

The following matrix defines the evidence categories required to support the score. The companion use guide expands these into detailed evidence item checklists.

| Evidence Category | Required For | Minimum Acceptable Evidence | Strong / Preferred Evidence | Cannot Be Substituted By | Required Before Phase 4 |
|---|---|---|---|---|---|
| Governing doctrine evidence | All scorecard pillars | Review of the named doctrine and acceptance documents with file-path references | Source excerpts or line references tied to each scoring pillar | General design opinion or prior chat memory | Yes |
| Mold Breaker study evidence | Pillar 2 and any related hard-stop gate | Review of both construction-tech UI/UX studies with mapped incumbent failure modes | Criterion-by-criterion mapping from studies to PCC scoring categories | “Looks better than Procore” or subjective comparison | Yes |
| PCC source evidence | All pillars | Specific file paths for shell, surfaces, primitives, state components, adapters, tests, and manifests reviewed | File-path index tied to each surface and scoring category | Screenshots alone | Yes |
| Visual surface evidence | Pillars 1, 2, 4, 5, 6 | Current screenshots for every in-scope surface | Full-page, above-the-fold, full-scroll, and state screenshots per surface | Source-code intent alone | Yes |
| Tenant-hosted runtime evidence | Pillars 3, 7, 9 | SharePoint-hosted screenshots or runtime notes | Tenant-hosted screenshots plus console and package/version proof | Local dev screenshots only | Yes |
| Breakpoint/container evidence | Pillars 4, 7, 8 | Screenshots or validation notes across required responsive modes | Desktop, laptop, tablet landscape, tablet portrait, phone/narrow, short-height, high-zoom, constrained canvas | One desktop screenshot | Yes |
| Accessibility evidence | Pillars 8 and 9 | Keyboard, focus, status, contrast, ARIA, and touch evidence | Keyboard walkthrough, focus screenshots, semantic review, automated and manual checks | Component source alone | Yes |
| Interaction/workflow evidence | Pillars 3, 5, 6 | Proof of primary actions, disabled states, read-only workflows, navigation paths, and command/search behavior | Scenario-based walkthroughs for priority workflows | Static screenshots alone | Yes |
| State-model evidence | Pillars 5, 6, 9 | Proof of loading, empty, error, degraded, preview, read-only, deferred, unauthorized, missing-config, and stale states where applicable | State screenshot set plus source/test coverage | Happy-path rendering only | Yes |
| Source-of-record/data-confidence evidence | Pillars 6 and 9 | Source ownership and read/write boundary review | Matrix mapping PCC, Procore, SharePoint, Sage, fixture/mock, HBI, and deferred states | Assumed integration behavior | Yes |
| Content/language evidence | Pillars 1, 2, 5, 6, 8 | Review of labels, headings, microcopy, state copy, and HBI authority language | Copy audit tied to construction roles and next-action clarity | Visual polish alone | Yes |
| Test evidence | Pillars 3, 4, 6, 8, 9 | Relevant tests for routing, layout, state, accessibility, or surface behavior | Test list plus pass/fail results and coverage notes | Manual impression only | Yes |
| Package/version evidence | Pillars 7 and 9 | Confirmation of package, commit, version, or build being scored | Package/version aligned to screenshots, runtime proof, and final score | Screenshots with unknown build | Yes |
| Hard-stop evidence | All hard-stop gates | Checklist showing each hard stop passed, failed, or not applicable | Hard-stop report with evidence links and residual risks | Total score alone | Yes |
| Closure/reproducibility evidence | Pillar 9 | Final score, rationale, evidence index, open issues, and readiness statement | Independent re-score or peer audit using the same evidence | Unsupported conclusion | Yes |

---

## 18. Category-to-Surface Applicability Matrix

| PCC Surface / System | P1 Strategy | P2 Mold Breaker | P3 Shell/Nav | P4 Layout | P5 Workflow | P6 State | P7 Responsive | P8 A11y | P9 Evidence |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Shell / Frame | High | High | High | Medium | Medium | Medium | High | High | High |
| Project Hero / Identity | High | Medium | High | Medium | Medium | Medium | High | High | High |
| Navigation / Tabs | High | High | High | Medium | High | Medium | High | High | High |
| Bento / Card Primitives | High | High | Medium | High | Medium | High | High | High | High |
| Project Home | High | High | High | High | High | High | High | High | High |
| Project Readiness | High | High | Medium | High | High | High | High | High | High |
| Documents | High | Medium | Medium | Medium | High | High | Medium | High | High |
| External Platforms | High | High | Medium | High | High | High | Medium | High | High |
| Approvals | High | High | Medium | High | High | High | Medium | High | High |
| Team & Access | Medium | Medium | Medium | Medium | High | High | Medium | High | High |
| Site Health | High | Medium | Medium | Medium | High | High | Medium | High | High |
| Settings | Medium | Medium | Medium | Medium | Medium | High | Medium | High | High |

---

## 19. Scoring Validity Rules

A score is valid only if:

- Every scoring category is supported by evidence.
- Every hard-stop gate has been checked.
- Every critical finding distinguishes confirmed evidence from suspected risk.
- Screenshots and runtime proof correspond to the package/version being scored.
- Source-code intent is not used as a substitute for hosted, visual, accessibility, interaction, or breakpoint proof where such proof is required.
- Mold Breaker claims are tied to the construction-tech studies, not personal preference.
- Phase 4 readiness is stated directly and not implied.

---

## 20. Maintenance Notes

This scorecard should be updated when:

- The governing UI doctrine changes.
- PCC shifts from SPFx-only host assumptions to a broader installable/PWA posture.
- The construction-tech design decision studies are replaced or materially updated.
- Phase 4 acceptance criteria are formally revised.
- Additional PCC surfaces become part of the Phase 4 gate.
- Leadership changes the minimum acceptance threshold.

---

## 21. Appendix A — Compact Scoring Worksheet

| Pillar | Weight | Score | Notes / Evidence IDs |
|---|---:|---:|---|
| 1. PCC Product Strategy and Command-Center Clarity | 15 |  |  |
| 2. Construction-Tech Mold Breaker Differentiation | 20 |  |  |
| 3. Shell, Navigation, and Project Context | 12 |  |  |
| 4. Layout, Bento, Card Hierarchy, and Density | 12 |  |  |
| 5. Workflow, Interaction, and Next-Action Clarity | 12 |  |  |
| 6. State Model, Read-Only, Preview, Degraded, and Source Confidence | 10 |  |  |
| 7. Responsive, Field, Touch, and Host-Fit Behavior | 8 |  |  |
| 8. Accessibility, Visual Semantics, and Inclusive Use | 6 |  |  |
| 9. Evidence, Validation, and Phase 4 Readiness | 5 |  |  |
| **Total** | **100** |  |  |

---

## 22. Appendix B — Hard-Stop Worksheet

| Hard Stop | Pass / Fail / N/A | Evidence IDs | Notes |
|---|---|---|---|
| HS-01 Incumbent mimicry failure |  |  |  |
| HS-02 Command-center failure |  |  |  |
| HS-03 Cognitive-overload failure |  |  |  |
| HS-04 False-affordance failure |  |  |  |
| HS-05 Field-office divergence failure |  |  |  |
| HS-06 State-model failure |  |  |  |
| HS-07 Accessibility failure |  |  |  |
| HS-08 SharePoint host-fit failure |  |  |  |
| HS-09 Evidence failure |  |  |  |
| HS-10 HBI authority failure |  |  |  |
