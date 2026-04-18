# Dependencies, Patterns, and Development Concepts

## 1. Required vs optional additions

## No new runtime dependency is strictly required
The live repo already has the core ingredients needed for the main redesign:

- measured container-width state
- viewport short-height awareness
- mode-aware root/card components
- current tests and docs that can be refreshed

That means the core remediation can be completed without introducing new runtime package risk.

## Optional development dependency
### `@playwright/test` (only if the repo does not already have an equivalent screenshot path)
Use only if the project needs a durable screenshot-based responsive regression layer.

Reason:
- the target state is highly visual
- unit assertions alone will not fully protect composition quality
- screenshot assertions can validate named display classes and sparse states

## 2. External responsive concepts that should directly influence the remediation

## A. Container-aware responsiveness
Recommended posture:
- keep JS-derived container state as the primary contract seam
- consider CSS container queries as a progressive enhancement where they simplify component-local layout branching cleanly

Why this matters:
- Project Sites is nested inside SharePoint-hosted layout conditions
- viewport-only logic is insufficient
- component/container-aware behavior better matches the actual product reality

## B. Responsive contract as an explicit artifact
The repo already has a contract artifact.  
The remediation should strengthen it by adding:
- named display classes
- practical usable-space assumptions
- first-screen priorities
- card-density rules
- sparse-state rules
- hosted validation steps

## C. Progressive disclosure in constrained states
Directly applicable areas:
- active chips row
- secondary context summary
- filter entry and filter details
- metadata inside cards

The goal is not to hide truth.  
The goal is to surface the most task-relevant information first, then disclose secondary detail in tighter states.

## D. Density variants rather than uniform content
Project Sites now needs an information-density policy, not only a layout policy.

Directly applicable areas:
- chips shown by default
- count of metadata rows shown in compact mode
- whether launch-confidence copy is always inline or sometimes abbreviated
- how much identity furniture appears before the primary action

## E. Reflow-safe compact interaction design
Directly applicable areas:
- filter chip close buttons
- compact selects
- filter options
- action chips
- any future icon-only affordances

The redesign should explicitly respect target-size and reflow-safe compact behavior.

## F. Visual-regression-friendly responsive evidence
The app already exposes useful data hooks:
- `data-project-sites-layout-mode`
- `data-project-sites-short-height`
- `data-project-sites-control-layout`
- `data-project-sites-card-layout`

Those hooks can be reused in tests and visual evidence capture.

## 3. Concepts that should not be over-applied

## Do not force CSS container queries everywhere
They are useful, but the repo already has a working JS-derived mode seam.  
Adopt them only where they simplify and harden the implementation.

## Do not add motion-heavy responsive transitions
The current app already respects reduced-motion posture.  
Any new motion should stay restrained and should not become part of the responsive identity.

## Do not solve sparse wide states with decorative filler
The wide-state problem is one of composition authority, not ornament.

## 4. Recommended implementation pattern language

### Use these patterns
- explicit mode responsibilities
- tablet-first control grouping
- compact-first disclosure rules
- density variants by mode
- sparse-state composition rules
- contract + tests + hosted evidence together

### Avoid these patterns
- broad “just tweak spacing” remediation
- viewport-only breakpoint logic
- treating medium as nearly-compact
- leaving compact cards desktop-dense
- pretending the current contract artifact does not exist
