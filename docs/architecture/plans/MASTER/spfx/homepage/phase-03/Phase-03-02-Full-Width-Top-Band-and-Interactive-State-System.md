# Phase 03-02 — Full-Width Top-Band and Interactive-State System

## Objective

Build the **Phase 03 interactive and full-width composition layer** on top of the executed Phase 02 homepage visual system.

Phase 02 already delivered:
- homepage-local tokens,
- premium top-band/editorial styling,
- branded CTAs,
- motion/focus/media primitives,
- branded loading/empty states.

This prompt must convert that visual groundwork into a more complete **homepage interaction and top-band composition system**.

## First instruction

Do **not** re-read files that are already in your current context or memory. Re-read only if you need exact text for a surgical change.

## Governing handoff inputs

Primary Phase 02 inputs:
- `Phase-02-01-Completion-Note.md`
- `Phase-02-02-Completion-Note.md`
- `Phase-02-03-Completion-Note.md`
- `Homepage-Design-Token-Map.md`

Supporting Phase 01 baseline:
- `Homepage-Per-Webpart-Contract-Reference.md`
- `Homepage-Acceptance-Checklist.md`

## What this prompt must accomplish

### 1. Implement the full-width top-band composition posture
Phase 02 visually upgraded the welcome header and hero banner, but Phase 03 should complete the **top-band composition system**.

That should include, as justified by repo truth:

- more deliberate full-width behavior where supported,
- stronger top-band hierarchy,
- better spatial relationship between greeting and hero,
- clearer responsive behavior across wide and constrained layouts,
- and composition rules that feel homepage-native rather than card-stack-like.

### 2. Close the interactive-state gap that Phase 02 intentionally deferred
Phase 02 explicitly deferred hover/focus pseudo-class implementation because inline styles are limited. Close that gap in the most appropriate way for this package.

You may use the most appropriate styling mechanism already supported by the repo, including:
- CSS modules,
- Griffel,
- or another lightweight local approach that does not violate package doctrine.

Implement a coherent interactive-state system for:
- CTA links,
- search input,
- actionable utility tiles if applicable,
- and any other homepage interactions that materially benefit from hover/focus-visible treatment.

### 3. Audit CTA semantics
Phase 02 noted that CTA-as-button vs CTA-as-link remains unresolved.

Perform a targeted audit and apply the correct semantic treatment where warranted:
- navigational actions remain links,
- non-navigational actions should not masquerade as links.

Do not overcomplicate the package. Apply semantic improvements where there is real value.

### 4. Harden motion and reduced-motion behavior
Phase 02 added motion tokens and noted that only the hero currently gates motion properly.

Apply the correct reduced-motion posture wherever motion exists or is introduced in this prompt.
Keep motion restrained and homepage-appropriate.

### 5. Harden media presentation
Close the remaining media/composition polish items that belong in this phase:
- aspect-ratio or stable-size discipline where appropriate,
- layout-shift resistance,
- image container consistency,
- media presentation quality in editorial surfaces.

## Scope

### In scope
- top-band composition behavior
- local homepage styling mechanism for hover/focus-visible
- CTA semantic audit and targeted fixes
- motion and reduced-motion completion within homepage surfaces
- media presentation hardening
- structural test additions tied to these changes

### Out of scope
- property panes
- async data integration
- shell-extension work
- global design-system refactors outside the homepage lane

## Deliverables

1. Code changes implementing the full-width top-band and interactive-state system
2. Any new local styling assets required for hover/focus-visible behavior
3. Updated docs explaining the interaction-state and top-band posture
4. Test updates covering the new interaction/motion/semantic behavior
5. Completion note documenting:
   - what changed,
   - what styling mechanism was chosen,
   - what remains for Prompt 03

## Acceptance criteria

- Top-band composition is more deliberate and homepage-grade
- Hover/focus-visible states are implemented for key interactive elements
- Reduced-motion posture is no longer isolated only to the hero where relevant
- CTA semantics are cleaner and more intentional
- Media presentation is more stable and predictable
- Existing behavior and current tests do not regress
- New tests meaningfully cover the added interaction system

## Verification

Run and report:

- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts test`
- `pnpm --filter @hbc/spfx-hb-webparts build`

## Output format

Produce:
- code changes,
- updated docs,
- targeted tests,
- a concise completion note,
- and a short “remaining for Prompt 03” list.
