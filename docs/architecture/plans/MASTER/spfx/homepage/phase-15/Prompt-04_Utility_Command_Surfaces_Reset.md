# Prompt 04 — Utility Command Surfaces Reset

## Objective

Rebuild the utility / command surfaces so they feel like premium operational command modules rather than grouped lists inside white cards.

## Scope

Primary targets:

- `apps/hb-webparts/src/webparts/priorityActionsRail/*`
- any shared utility or command primitives
- related action-row, badge, icon, CTA, and rail-shell logic

## Current-State Problem to Solve

The current Priority Actions experience is functionally readable but visually dead. It does not communicate urgency, sequencing, ownership, or premium interaction quality strongly enough.

## Hard Gates

- Do **not** reread files already in your active context or memory.
- Do **not** keep a simple “group title + list rows + badge” presentation if it still feels generic.
- Do **not** leave critical and noncritical actions visually too similar.
- Do **not** accept a result that still reads like a basic task card.

## Required Outcomes

The redesigned command surface should:

- better distinguish due / blocked / pending / approval / watch states
- create clearer urgency choreography
- feel denser and more premium without becoming cluttered
- use stronger affordances and interaction quality
- look intentionally operational

## Implementation Requirements

1. Rebuild the Priority Actions surface around command posture, not passive content posture.
2. Improve row hierarchy, badge treatment, and action emphasis.
3. Introduce stronger differentiation for high-priority actions.
4. Tighten layout rhythm and scanning behavior.
5. Ensure keyboard/focus behavior remains strong.

## Validation

Show proof that:

- the command surface feels materially more urgent and intentional
- action states are easier to scan
- the rendered result no longer looks like a standard content card
- no accessibility regressions were introduced

## Output Format

Return:

1. summary of command-surface weaknesses removed
2. files changed
3. hierarchy improvements introduced
4. rendered-state proof

## Final Instruction

Do not soften this work.

The current homepage is not acceptable. The goal of this phase is to produce measurable visual improvement that can be seen immediately in the rendered experience, not merely explained in code review.
