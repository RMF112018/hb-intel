# Prompt 05 — Discovery and Launcher Redesign

## Objective

Rebuild Tool Launcher / Work Hub and Smart Search / Wayfinding as premium, high-value discovery systems. These surfaces must stop feeling like scaffolding and start behaving like intentional entry points into work.

## Scope

Primary targets:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/*`
- `apps/hb-webparts/src/webparts/smartSearchWayfinding/*`
- any shared launcher/discovery primitives
- iconography and quick-path presentation logic

## Current-State Problem to Solve

These are two of the weakest rendered experiences on the page. The launcher feels under-authored and the discovery surface looks ordinary despite being strategically important.

## Hard Gates

- Do **not** reread files already in your active context or memory.
- Do **not** keep initials-as-icons.
- Do **not** keep the current search box / quick paths / resource list posture if it still feels generic.
- Do **not** return a result that still looks like a simple form field inside a card plus a list of links.

## Required Outcomes

The redesigned launcher/discovery system should:

- feel premium and immediately useful
- use real iconography
- create stronger featured vs supporting paths
- improve scanability and wayfinding confidence
- make discovery feel like a first-class part of the homepage

## Implementation Requirements

1. Replace placeholder-grade icon treatment with real iconography.
2. Rebuild launcher grouping and hierarchy.
3. Rebuild search and discovery framing with stronger zero-state and promoted-destination posture.
4. Improve quick-path and category presentation.
5. Keep interaction quality strong and deliberate.

## Validation

Show proof that:

- launcher no longer feels like scaffolding
- discovery no longer feels like a plain search field inside a card
- iconography is materially stronger
- the rendered result now reads as a premium utility/discovery system

## Output Format

Return:

1. summary of launcher/discovery weaknesses removed
2. files changed
3. iconography strategy implemented
4. rendered-state proof

## Final Instruction

Do not soften this work.

The current homepage is not acceptable. The goal of this phase is to produce measurable visual improvement that can be seen immediately in the rendered experience, not merely explained in code review.
