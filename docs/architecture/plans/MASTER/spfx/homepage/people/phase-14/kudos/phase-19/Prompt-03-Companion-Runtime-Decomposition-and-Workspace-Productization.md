# Prompt 03 — Companion runtime decomposition and workspace productization

## Objective

Refactor the HB Kudos Approval Companion so `HbKudosCompanion.tsx` is no longer materially overgrown and the governance workspace becomes more coherent, readable, and productized.

## Files in scope

Primary targets:
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`

You may add narrowly scoped local files for:
- queue filter model / helpers
- queue toolbar controls
- queue row rendering
- detail-panel shells
- action routing helpers
- dialog workflow helpers
- companion-specific product composition seams

## Problems to correct

### 1. `HbKudosCompanion.tsx` is too large and multi-responsibility
Split responsibilities into clearer local seams.

### 2. The workspace is under-productized
The companion already has rich workflow depth.
It needs stronger local composition, clearer product seams, and better readability.

### 3. Local shared governance UI seams need strengthening
The shared governance primitives should better support the companion rather than leaving too much local one-off rendering logic in the top-level container.

## Required implementation direction

### 1. Decompose the container responsibly
Extract real seams for:
- queue filters / toolbar
- queue row rendering
- detail-panel structure
- action workflow orchestration

### 2. Preserve workflow depth
Do not simplify away important governance behavior:
- tabs
- filters
- ownership
- bulk approve
- role-aware detail panel
- scheduling / prominence / review actions
- audit timeline

### 3. Improve workspace readability and productization
The companion should read like a mature internal product surface, not an oversized implementation file.

### 4. Keep the runtime model legible
Do not replace understandable explicit logic with overabstracted indirection.

## Constraints

- Do not redesign the underlying workflow semantics.
- Do not weaken role safety.
- Do not remove action capabilities unless a capability is provably dead or broken.
- Do not turn the companion into a generic admin CRUD panel.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not keep oversized helper logic buried in the container if there is a clear extraction boundary.
- Do not over-fragment the workspace into meaningless tiny components.

## Deliverable

Implement the refactor and report:
- the new companion file/component structure
- what responsibilities left `HbKudosCompanion.tsx`
- what shared local governance seams were strengthened
- what productization improvements were made without changing workflow semantics
