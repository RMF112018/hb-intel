# README — HB Kudos Companion P0 Closure Prompt Package

## Purpose

This package contains the **P0-only** remediation prompts for the **HB Kudos Companion**.

It is intentionally scoped to the doctrine-aligned P0 issues and should be executed before broader structural or Wave 1 enhancement work.

## Governing doctrine

The prompts in this package are governed first by:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

These prompts assume the Companion is:

- a SharePoint-hosted page-canvas webpart
- part of the homepage-family runtime under `apps/hb-webparts`
- required to be host-aware, author-safe, and professionally resilient in degraded states

## Package contents

- `Plan-Summary.md`
- `Prompt-01-P0-Load-Error-Empty-State-Closure.md`
- `Prompt-02-P0-Degraded-Misconfigured-Partial-State-Closure.md`
- `Prompt-03-P0-Authoring-and-Host-Safe-Hardening.md`
- `Prompt-04-P0-Inline-Visual-Authoring-Retirement.md`

## How to use this package

Execute the prompts in numeric order.

Do not skip Prompt 01 or Prompt 02. Those two prompts establish the minimum production-safe runtime behavior required by the SPFx doctrine.

Prompt 03 should then harden host and authoring behavior.

Prompt 04 should close the remaining P0 source-discipline problem by retiring prohibited inline visual authoring from the ordinary homepage source of the Companion runtime.

## Execution guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not introduce fake shell chrome or duplicate navigation.
- Do not drift into unrelated public-webpart redesign work.
- Do not broaden imports to `@hbc/ui-kit` root or `@hbc/ui-kit/app-shell` inside homepage webpart code.
- Do not use subtle styling-only tweaks as a substitute for structural P0 closure.
- Do not weaken current role, workflow, or audit behavior while addressing UI/runtime hardening.

## Definition of done for this package

The package is complete only when:

- the Companion has explicit and distinct **error**, **empty**, and **filtered-empty** states
- degraded or incomplete runtime conditions produce professional, bounded outcomes
- host-safe and authoring-safe behavior is materially stronger and easier to reason about
- prohibited inline visual authoring has been retired or materially reduced from the Companion runtime source
- validation confirms the Companion still behaves correctly in the dev harness and SharePoint-hosted assumptions
