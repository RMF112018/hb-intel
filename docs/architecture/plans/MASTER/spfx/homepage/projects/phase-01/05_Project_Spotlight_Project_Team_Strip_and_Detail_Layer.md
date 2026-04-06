# Prompt 05 — Project Spotlight Project Team Strip and Detail Layer

## Objective

Add the **Project Team** strip inside the featured spotlight and implement the first detail-layer interaction without breaking the editorial hierarchy.

## Prerequisite

Complete Prompts 01 through 04 first.

Do **not** re-read files already in your current context or memory unless they changed, your context is stale, or the task scope expanded.

## Required Product Outcome

The team layer should add:

- human context
- visual warmth
- recognition of the team behind the project

It must **not** become:

- a detached team roster card
- a noisy org chart
- a modal dump of person records
- a competing focal point

## Version 1 Data Strategy

Use the approved Version 1 person-field strategy from the earlier planning:

- multi-select person source
- compact avatar strip
- up to 5 visible avatars
- `+N` overflow indicator
- lightweight detail reveal

Do not overbuild role ordering or child-list assignment infrastructure in this phase.

## Specific Implementation Work

### 1. Implement the Project Team strip
Place the strip inside the featured spotlight in the approved internal location.

### 2. Implement avatar behavior
- circular headshots
- initials fallback where needed
- visible max count
- overflow indicator

### 3. Implement first detail layer
Use the approved desktop interaction pattern:
- anchored flyout
- anchored overlay
- lightweight panel

Choose the option that best fits the repo’s existing interaction primitives and homepage quality bar.

### 4. Implement detail contents
At minimum:
- headshot
- full name
- optional title/role only if already safely available
- keep spacing compact and polished

### 5. Implement focus and close behavior
Support:
- keyboard opening
- escape close
- focus return
- non-hover-only discovery

## Required Deliverables

### A. Team Layer Summary
Explain how the strip and detail layer work and why they fit the featured spotlight.

### B. Interaction Choice Rationale
Explain why the chosen reveal pattern was appropriate for desktop homepage behavior.

### C. Reuse vs New Build Summary
State what primitives were reused, what stayed local, and why.

## Validation Requirements

Before closing:

- verify the Project Team strip supports the card instead of competing with it
- verify 0, 1, 5, and 10+ member states
- verify missing photos degrade gracefully
- verify focus management and close behavior
- run the smallest credible lint/type/test validation for the touched scope

## Risk Exposure

Watch for:
- heavy modal behavior
- cluttered member layout
- oversized avatars
- too much detail in the flyout
- accessibility regressions

## Standards / Best Practices

- teaser first, detail on demand
- human, not bureaucratic
- warm, not noisy
- polished, not overbuilt
- accessibility required

## Final Instruction

Do not fully solve tablet/mobile reveal fallbacks in this prompt beyond safe interim behavior.

This prompt is complete only when the Project Team strip and desktop detail layer feel natural inside the featured spotlight.
