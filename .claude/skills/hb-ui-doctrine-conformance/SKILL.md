---
name: hb-ui-doctrine-conformance
description: Review HB Intel UI work for doctrine fit, @hbc/ui-kit ownership, token/primitive/surface-family alignment, SPFx/PWA consistency, accessibility, basis-of-design fit, and premium product quality.
when_to_use: Use for UI kit cleanup, UI doctrine, homepage surfaces, SPFx UI, dashboard UX, basis-of-design images, brand assets, accessibility, responsive behavior, or premium custom HB product quality reviews.
argument-hint: "[UI surface, component, package, or design question]"
context: fork
agent: hb-ui-ux-conformance-reviewer
allowed-tools: Read, Grep, Glob
---

# HB UI Doctrine Conformance

Review UI conformance for:

```text
$ARGUMENTS
```

## Objective

Assess whether the proposed or implemented UI aligns with HB Intel’s current UI doctrine, package ownership model, brand quality expectations, accessibility requirements, and runtime context.

## Review Layers

1. **Foundations**
   - tokens;
   - typography;
   - spacing;
   - color;
   - elevation;
   - motion;
   - light/dark behavior;
   - brand assets.

2. **Primitives**
   - buttons;
   - fields;
   - badges;
   - cards;
   - drawers;
   - tabs;
   - controls.

3. **Surface Families**
   - homepage SPFx surfaces;
   - full-page SPFx apps;
   - dashboard/cockpit surfaces;
   - PWA surfaces;
   - widget/embedded surfaces.

4. **Consumers**
   - local app/page composition;
   - feature-specific authored UI;
   - package-local wrappers;
   - shared `@hbc/ui-kit` usage.

## Required Checks

- Does durable reusable UI belong in `@hbc/ui-kit` or a shared UI boundary?
- Is the work over-centralizing feature-specific compositions?
- Is the UI responsive and device-aware?
- Does it avoid rigid layouts that create overflow?
- Is accessibility covered beyond color and hover-only meaning?
- Does missing data produce a polished preview/fallback state?
- Does the result feel like a premium custom HB product without reinventing common primitives?
- Are basis-of-design assets treated as direction unless explicitly stated as pixel-perfect requirements?

## Output Format

## Conformance Verdict

Use one:

- **Conforms**
- **Conforms with Minor Gaps**
- **Requires Remediation**
- **Doctrine Conflict / Needs Decision**

## Evidence

- <files, components, docs, screenshots/basis assets if available>

## Findings

- <finding, severity, recommendation>

## Required Remediation Prompt

Provide copy-ready remediation instructions if needed.


## Standing Constraints

- Use current repo truth before historical summaries.
- Do not re-read files still in active context unless they may have changed, line-level proof is needed, validation/closeout requires proof, scope expanded, or the user asked for a repo-truth audit.
- Separate evidence from recommendation.
- State uncertainty explicitly.
- Do not broaden scope into adjacent cleanup unless the user explicitly authorizes it.
- Do not claim completion without stating what was actually inspected or verified.

