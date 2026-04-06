# Prompt 07 — Project Spotlight Ranking, Freshness, and Authoring Safety

## Objective

Implement and harden the editorial selection logic, freshness handling, and authoring safety rules for Project Spotlight after the surface system is already strong.

## Prerequisite

Complete Prompts 01 through 06 first.

Do **not** re-read files already in your current context or memory unless they changed, your context is stale, or the task scope expanded.

## Required Product Outcome

Project Spotlight should now be operationally dependable without losing its editorial quality.

Selection logic should feel curated, not random, and the module should fail gracefully when content quality is imperfect.

## Required Version 1 Logic

Support a practical Version 1 editorial model covering:

- homepage enablement
- featured selection
- supporting selection
- featured ranking
- publish/freshness recency fallback
- milestone/status normalization
- empty and low-content handling

## Specific Implementation Work

### 1. Implement deterministic selection helpers
Support:
- featured project selection
- supporting item selection
- tie-break behavior
- exclusions

### 2. Implement freshness and milestone normalization
Convert raw data states into clean presentation-friendly labels.

### 3. Harden incomplete-content behavior
Handle:
- missing image
- missing summary
- missing headline
- missing freshness
- not enough supporting items

### 4. Implement authoring safety defaults
The module should still produce a good outcome without perfect content every time.

### 5. Keep automation secondary to editorial control
Do not build advanced automation or personalization here.

## Required Deliverables

### A. Selection Logic Summary
Explain the final Version 1 ranking and selection behavior.

### B. Fallback Behavior Summary
Explain how imperfect content is handled.

### C. Authoring Safety Summary
Explain how the module protects the homepage from weak author inputs.

## Validation Requirements

Before closing:

- verify deterministic featured selection
- verify deterministic supporting selection
- verify content fallbacks do not break the hierarchy
- verify missing-field scenarios remain visually stable
- run the smallest credible lint/type/test validation for the touched scope

## Risk Exposure

Watch for:
- logic complexity outpacing product need
- brittle selection logic
- weak empty/low-content behavior
- too many content states exposed directly to the UI
- editor-unfriendly rules

## Standards / Best Practices

- editorial control first
- deterministic helpers
- graceful degradation
- calm fallback states
- avoid overbuilding Version 1

## Final Instruction

Do not add advanced personalization, audience targeting, or variant modes in this prompt.

This prompt is complete only when the module is both premium in presentation and reliable in day-to-day authoring use.
