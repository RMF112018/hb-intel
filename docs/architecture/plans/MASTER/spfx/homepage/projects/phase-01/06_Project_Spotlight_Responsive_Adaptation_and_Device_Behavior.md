# Prompt 06 — Project Spotlight Responsive Adaptation and Device Behavior

## Objective

Adapt Project Spotlight across desktop, tablet, and mobile while preserving the featured-first hierarchy and premium interaction quality.

## Prerequisite

Complete Prompts 01 through 05 first.

Do **not** re-read files already in your current context or memory unless they changed, your context is stale, or the task scope expanded.

## Required Product Outcome

Across all breakpoints:

- the featured project must remain first and dominant
- supporting content must stay secondary
- interaction must remain clean and understandable
- the team detail layer must degrade appropriately for touch and smaller screens

## Required Responsive Direction

### Desktop
- featured spotlight plus supporting rail
- Project Team detail can use anchored interaction

### Tablet
- featured spotlight on top
- supporting items below in a disciplined adapted layout
- detail layer may widen or move to a panel-style presentation

### Mobile
- featured spotlight first
- supporting items below in stacked or swipe-safe behavior
- Project Team detail should use a safer full-width or bottom-sheet style fallback

## Specific Implementation Work

### 1. Implement breakpoint-aware layout adaptation
Preserve hierarchy while reflowing responsibly.

### 2. Adapt supporting rail behavior
Prevent clutter and preserve scanability at smaller widths.

### 3. Adapt the Project Team detail interaction
Ensure touch-safe, width-safe behavior on tablet and mobile.

### 4. Validate image and text behavior
Check:
- crop quality
- line truncation
- metadata legibility
- CTA clarity

### 5. Validate interaction quality
Ensure hover-dependent behavior does not become required on smaller devices.

## Required Deliverables

### A. Responsive Behavior Summary
Describe the final behavior at desktop, tablet, and mobile.

### B. Interaction Fallback Summary
Explain how the team detail layer adapts across devices.

### C. Residual Limitations
State any remaining responsive limitations that should be addressed later.

## Validation Requirements

Before closing:

- verify the featured project remains the clear primary story at all breakpoints
- verify supporting items do not dominate or clutter
- verify the team detail interaction is touch-safe
- verify text and imagery remain readable and premium
- run the smallest credible lint/type/test validation for the touched scope

## Risk Exposure

Watch for:
- hierarchy collapse on smaller screens
- unusable anchored overlays on touch
- overly dense supporting layouts
- broken crop behavior
- CTA ambiguity

## Standards / Best Practices

- featured-first always
- adapt, do not flatten
- touch-safe interactions
- hover as enhancement only
- calm and premium across all widths

## Final Instruction

Do not broaden into advanced authoring logic in this prompt.

This prompt is complete only when the module behaves convincingly across desktop, tablet, and mobile.
