# Prompt 01 — Phase D Repo-Truth and Surface-Family Contract

## Objective

Conduct a repo-truth-anchored audit of the current implementation for these homepage surfaces:

- Company Pulse
- Leadership Message
- People & Culture
- Project / Portfolio Spotlight
- Safety & Field Excellence

Also inspect the relevant shared dependencies in:
- `apps/hb-webparts`
- `packages/ui-kit`
- any homepage-specific shared entry points in the UI kit
- any directly relevant docs or design-system doctrine

Your job in this prompt is **not** to fully implement the redesign yet.

Your job is to establish the **implementation contract** for Phase D:
1. current file/component ownership
2. current shared primitives and bottlenecks
3. the target surface-family architecture
4. the minimum shared-kit additions required before webpart-level refactors

## Hard instruction

Do **not** re-read files that are already in your current context or active memory unless needed to resolve uncertainty or confirm a changed assumption.

## Required outputs

Create a concise but rigorous Phase D contract document that includes:

### 1. Repo-truth component map
For each in-scope webpart, identify:
- main entry files
- major subcomponents
- shared homepage shell dependencies
- card/typography/badge/CTA dependencies
- data shape or content model dependencies that materially affect redesign work

### 2. Current-state design-pattern map
Identify which design patterns are currently over-shared across the five surfaces, such as:
- featured + secondary cluster rhythm
- generic card wrapper
- generic metadata row
- badge-led identity
- weak CTA pattern
- undifferentiated footer/action zones

### 3. Target surface-family model
Define the target family for each surface:
- editorial/news
- executive/authored
- people/recognition
- operational/project intelligence
- safety/signal

For each family, define:
- primary hierarchy model
- metadata model
- CTA model
- preferred media treatment
- preferred surface treatment
- constraints / anti-patterns

### 4. Shared-kit dependency plan
List the specific shared-kit primitives, variants, or utility expansions that should exist before local component implementation begins.

### 5. Phase D execution contract
Recommend the exact implementation order for the remaining Phase D prompts, with justification.

## Implementation rules

- Preserve repo truth.
- Prefer shared abstractions when at least two target surfaces need the same capability.
- Do not create a single “super generic homepage feature card” as the answer.
- Keep SharePoint/SPFx runtime realism in view.
- Keep accessibility, keyboard focus, and reduced motion as non-negotiable.

## Deliverables

At minimum:
- one Phase D contract markdown document
- any lightweight TODO/checklist file(s) needed to guide downstream prompts

## Risk Exposure

- Misidentifying shared primitives will create rework in later prompts.
- Over-generalizing the design language will weaken differentiation.
- Over-specializing too early will create duplicated code.

## Standards / Best Practices

- Repo-truth anchored
- Shared kit first
- Distinct surface families
- Accessible hierarchy
- Reduced-motion aware
- Maintainable component ownership
