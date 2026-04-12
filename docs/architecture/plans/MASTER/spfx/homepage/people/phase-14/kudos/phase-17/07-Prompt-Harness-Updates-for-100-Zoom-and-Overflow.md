# 07 — Prompt: Harness Updates for 100% Zoom / Overflow / Safe-Zone Validation

## Mission

Update the existing HB Kudos Playwright webparts harness so the new compaction and overflow-hardening work is fully validated.

## Governing rule

No visual compaction or hosted-overflow fix is complete unless the harness proves it.

## Scope

In scope:
- public-surface specs
- hosted/runtime specs
- public-surface locators
- public-surface layout-stress fixtures / baselines

## Required harness work

### A. Locator coverage
Add or update stable hooks for:
- surface root
- hero band
- hero CTA row
- Give Kudos CTA
- View All CTA
- featured card
- featured avatar zone
- featured excerpt block
- recent section root and rows
- archive section root, search, and rows
- footer / bottom safe-zone sentinel if used

### B. Fixture coverage
Add or update a public-surface density baseline that exposes:
- meaningful featured content
- multiple recent rows
- multiple archive rows
- enough lower-surface content to reveal 100% zoom and obstruction issues

Add or update a hosted profile that simulates the bottom-right assistant-overlay risk.

### C. Assertions
Update or add assertions for:
- desktop 100% zoom first-viewport composition
- desktop 90% zoom comparison
- reduced-width hosted desktop
- iPhone 12 Pro hosted view
- top safe-zone integrity
- bottom-right safe-zone integrity
- beginning-of-recent visibility at desktop 100%
- archive search / rows remain reachable and operable
- focus-visible behavior for changed controls
- no-dead-CTA coverage for changed controls

## Prohibited shortcuts

- no manual-only proof
- no “looks fine” closure without harness evidence
- no brittle text-only critical selectors
- no drift into unrelated companion/admin work

## Required proof

- targeted Playwright run output
- curated screenshots for the required viewport/zoom states
- list of locator additions/changes
- note of any fixture changes made to support the new validation
