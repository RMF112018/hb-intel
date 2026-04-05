# Phase-04-01 — Shell Extension Architecture and Scaffold

## Objective

Create the dedicated **Lane B shell-extension product package** and establish its architecture, package boundary, build/runtime scaffold, docs, and verification baseline.

The outcome of this prompt should be a real `apps/hb-shell-extension` implementation lane, not just plan text.

## Repo truth and constraints to respect

- Lane A (`apps/hb-webparts`) already owns homepage page-canvas content.
- Lane B must own supported shell-adjacent rendering only.
- Shell work must render via supported SharePoint placeholder regions only.
- No suite-bar replacement, no app-bar takeover, no DOM suppression, and no unsupported CSS override strategy.
- Lane B should use `@hbc/ui-kit/app-shell` as its primary UI entry point.
- Supporting imports may use `@hbc/ui-kit/theme` and `@hbc/ui-kit/icons`.
- Do not re-open homepage composition work in this prompt.

## Required implementation tasks

### 1. Create the package/app lane

Create the new shell-extension package/app structure:

- `apps/hb-shell-extension/`
- package manifest and scripts
- source folder structure
- build config
- test config
- README

Use the same monorepo conventions as the other app lanes, but keep the package intentionally narrow and shell-specific.

### 2. Define the Lane B package boundary

Create or update authoritative documentation that states:

- what Lane B owns
- what Lane B does not own
- how it differs from Lane A
- which SharePoint regions it may render into
- which behaviors are explicitly prohibited

Document the relationship between:

- page-canvas homepage product
- shell-extension product
- navigation/governance lane

### 3. Establish the extension runtime scaffold

Implement the shell-extension runtime scaffold sufficient for later prompts to build on, including:

- supported placeholder discovery
- mount/unmount lifecycle
- top placeholder hook
- bottom placeholder hook
- graceful no-placeholder behavior
- safe no-op behavior when unsupported placeholders are unavailable
- global/runtime contract if needed by the packaging pipeline

### 4. Establish UI import discipline for Lane B

Document and enforce the correct import posture for the shell-extension lane:

- allowed: `@hbc/ui-kit/app-shell`
- allowed as needed: `@hbc/ui-kit/theme`, `@hbc/ui-kit/icons`
- prohibited by default: broad `@hbc/ui-kit`
- prohibited: `@hbc/ui-kit/homepage`

Add lint guardrails if appropriate.

### 5. Add baseline tests

Create structural tests that verify:

- the Lane B package exists and exports the expected runtime seam(s)
- top and bottom placeholder scaffolds are wired
- prohibited entry points are not used
- no direct unsupported SharePoint shell takeover patterns are present in the new lane
- the package can fail safely when placeholders are missing

## Required docs and artifacts

Create or update, at minimum:

- Lane B README
- shell-extension boundary doc or Phase 04 boundary note
- phase completion note path scaffolding if you use it during implementation
- any package inventory or seam taxonomy doc needed to stabilize the new lane

## Acceptance criteria

This prompt is complete only when:

- `apps/hb-shell-extension` exists as a real lane
- its README reads like a product/runtime lane, not a scaffold stub
- top/bottom placeholder scaffolding exists
- import rules are explicit and enforced or documented as enforceable
- verification passes:
  - `check-types`
  - `lint`
  - `build`
  - `test`

## Hard prohibitions

Do not:

- render into unsupported DOM anchors
- replace SharePoint shell chrome
- import homepage primitives into Lane B unless explicitly justified and documented
- move Lane A concerns into Lane B
