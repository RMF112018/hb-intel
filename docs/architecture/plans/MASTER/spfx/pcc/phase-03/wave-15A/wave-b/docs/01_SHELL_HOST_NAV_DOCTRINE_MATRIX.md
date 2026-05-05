# 01 — Shell / Host / Navigation Doctrine Matrix

## Objective

Translate binding UI doctrine, SPFx full-page overlay requirements, host-runtime validation standards, breakpoint/container-fit standards, and the adapted 56-point scorecard into Wave B-specific criteria.

## Adaptation Rule

The homepage checklist/scorecard provides scoring rigor, not homepage-specific layout authority. PCC is governed as a non-homepage, full-page/widget-style SPFx command-center surface.

## Criteria Matrix

| ID | Group | Source | Requirement Summary | Applicability | Acceptance Threshold | Evidence Required | Gate Type | Likely Source Areas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B-C01 | Shell purpose/hierarchy | Full-Page App Overlay §3 | App-local shell may use navigation, command/search, dark intelligence header, KPI/status zones when host-safe. | Shell/header/nav | Shell clarifies PCC identity without competing with SharePoint chrome. | Before/after screenshots; source diff; scorecard notes. | Major factor | `PccShell`, `PccProjectIntelligenceHeader` |
| B-C02 | Shell purpose/hierarchy | Full-Page App Overlay §4 | Avoid fake shell duplication and host chrome competition. | Shell/header/nav | No SharePoint chrome imitation; no oversized competing app chrome. | Tenant screenshots, hard-stop checklist. | Hard gate | shell CSS, SPFx host wrapper if present |
| B-C03 | Host fit | Host Runtime Validation Standard | Hosted runtime must prove shell behavior, breakpoint fit, keyboard/focus viability. | Published/edit SharePoint | Evidence must include hosted or explicit tenant gap. | Tenant screenshot index and local fallback evidence. | Hard gate | `PccShell.module.css`, packaging/host files |
| B-C04 | Header/project identity | Acceptance/Scoring Model | Full-page/PCC surfaces require KPI/status/command zone clarity and hierarchy. | Header/context band | Project number/name/status/phase/source confidence visible but compact. | Screenshots all surfaces. | Major factor | `PccProjectIntelligenceHeader`, new context primitive |
| B-C05 | Navigation IA | Full-Page App Overlay §3 | App-local navigation is allowed if host-safe and productized. | Rail/top strip | Nav grouped by operational workflow, not flat module list. | Tests and screenshots. | Major factor | `PccNavigationRail` |
| B-C06 | Active/hover/focus nav state | Accessibility contract | Keyboard path integrity, focus-visible behavior, no hover-only critical meaning. | Nav/command | Active item uses `aria-current`; focus visible; group traversal works. | Unit tests and visual focus screenshot. | Hard gate for accessibility | `PccNavigationRail`, CSS |
| B-C07 | Diagnostics placement | Acceptance model hard stops | Avoid misleading primary interaction/state. | Preview/build/source indicators | Diagnostics subordinated; product-grade source-confidence cue retained. | Screenshot and state tests. | Major factor | shell/header/status primitives |
| B-C08 | Search/command input | Interaction completeness | Primary controls must not be misleading or dead. | Command search | Non-functional search is clearly scoped/inert or reduced. | Tests for disabled/read-only semantics; screenshot. | Major factor / possible hard gate | `PccCommandSearch` |
| B-C09 | Scroll ownership | Host runtime + container fit standards | Avoid constrained-height traps, double scroll, horizontal overflow. | Host + all surfaces | Content owns scroll predictably; shell does not force viewport assumptions. | Local + tenant screenshots; overflow tests if feasible. | Hard gate | shell CSS, layout CSS |
| B-C10 | Responsive/container behavior | Breakpoint standard | Evaluate by container width/height, not viewport alone. | all responsive modes | Every mode has intentional hierarchy and reachable nav. | Responsive tests/screenshots. | Hard gate | `useContainerBreakpoint`, rail variants, shell CSS |
| B-C11 | Visual hierarchy/token discipline | Scorecard token/styling | Governed tokens, no high-saturation blocks overpowering content. | shell/nav/header | Shell chrome is subordinate; active states are refined. | Screenshots; CSS review. | Major factor | CSS modules, theme vars |
| B-C12 | Tenant evidence | Acceptance model | Evidence-backed closure required; “looks good” not enough. | Wave closeout | Scored category sheet and screenshot index exist. | `Prompt_07` closeout. | Hard gate | docs/evidence |

## Scorecard Categories Improved by Wave B

- Doctrine and host compliance.
- Token and styling discipline.
- Purpose-fit sophistication and persona expression.
- Surface composition and hierarchy.
- Breakpoint and shell-fit quality.
- Interaction completeness.
- Accessibility and keyboard behavior.
- Host-runtime resilience.
- Validation and closure proof.

Wave B should not score every category 4/4; it creates the shell/nav/host foundation for later waves.
