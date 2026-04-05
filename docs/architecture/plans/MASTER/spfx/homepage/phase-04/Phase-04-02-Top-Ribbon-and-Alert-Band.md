# Phase-04-02 — Top Ribbon and Alert Band

## Objective

Implement the **top placeholder** shell-extension experience for Lane B, including the top ribbon / contextual utility strip and the governed alert / announcement band.

This prompt should produce a visibly real top-placeholder product surface while staying strictly within supported placeholder behavior.

## Starting assumptions from Prompt 01

Prompt 01 has already established:

- the `apps/hb-shell-extension` lane
- its runtime scaffold
- placeholder discovery/mount seams
- import rules and package boundary
- baseline verification

Build on that foundation rather than re-litigating it.

## Product goals for the top placeholder surface

The top placeholder surface should:

- feel premium and coherent with HB Central
- remain lighter and more host-cooperative than the homepage lane
- provide concise utility value
- support alert/announcement rendering without trying to become the site shell
- degrade safely when no alert or utility data is configured

## Required implementation tasks

### 1. Implement top placeholder composition

Create the top placeholder composition system for Lane B. It should support:

- a lightweight ribbon/utility strip
- an alert or announcement band
- optional contextual content blocks that remain shell-adjacent and concise
- safe stacking/order rules if more than one top surface is present

This should be a Lane B composition system, not a copy of the homepage top band.

### 2. Establish shell-local styling and interaction posture

Implement the visual and interaction system for the top placeholder surface.

Requirements:

- premium but restrained styling
- visible keyboard focus
- reduced-motion-safe behavior
- no aggressive animation
- no large editorial/card-heavy homepage treatment
- clear CTA affordances only where appropriate
- hover/focus behavior handled in a robust way

Use the established shell entry-point discipline and keep styling local to the Lane B package unless shared promotion is clearly justified.

### 3. Implement alert-band rules

Create the governed alert-band behavior, including:

- empty/no-config behavior
- dismissibility rules if appropriate
- severity handling if appropriate
- spacing and stacking rules
- clear non-duplication with homepage webparts

The alert band must stay concise and shell-adjacent.

### 4. Add structural and behavioral tests

Tests should verify:

- top placeholder rendering path exists
- alert-band renders correctly when configured
- safe behavior when no content is configured
- focus and reduced-motion behavior are represented in the implementation
- no unsupported placeholder or DOM takeover logic is introduced

### 5. Update documentation

Update Lane B documentation so repo truth reflects:

- what the top placeholder surface now does
- what it intentionally does not do
- how it relates to homepage webparts
- how alert-band content is expected to behave

## Acceptance criteria

This prompt is complete only when:

- the Lane B top placeholder surface is implemented
- the alert/announcement band is real and governed
- verification passes:
  - `check-types`
  - `lint`
  - `build`
  - `test`
- documentation reflects the new top placeholder capability
- the resulting implementation still respects supported SharePoint customization posture

## Hard prohibitions

Do not:

- recreate the homepage hero/banner concept in the shell
- add app-shell takeover behavior
- fake full tenant navigation
- introduce unsupported host manipulation
