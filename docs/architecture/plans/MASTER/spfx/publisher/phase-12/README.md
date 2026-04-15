# Publisher UI Remediation — Wave 01 (Enhanced Closure Package)

This package is the **repo-truth-enhanced Wave 01 closure package** for the HB Publisher UI.

It replaces the weaker baseline package with prompts that are more specific about:

- the actual current implementation state
- the exact seams that still need closure work
- hidden dependencies required for true Wave 01 completion
- proof-of-closure expectations
- what must be preserved versus what must change

## Wave objective

Move the Publisher from a technically improved but still workmanlike SharePoint authoring workspace into a **cohesive, premium, editorial authoring product** that authors can trust and want to use.

## What changed from the baseline package

The original Wave 01 package was directionally correct, but it was no longer sufficiently precise against the live `main` branch. In particular, it understated that the repo already contains:

- a section-based shell
- a real queue rail
- a TipTap-based story editor
- visual team and media managers
- distinct preview and readiness surfaces
- a local Publisher shared-chrome seam
- centralized friendly-label governance

Accordingly, this enhanced package:

- **rewrites** broad “rebuild” prompts into tighter closure prompts
- **adds** a missing prompt for label governance and selector/accessibility hardening
- **tightens** visual-system work around the Publisher token seam already present in the repo
- **preserves** working state, controller, and persistence logic unless a prompt explicitly requires a bounded change
- **raises** the validation bar so prompts cannot be “closed” by cosmetic edits alone

## Prompt execution order

Run the prompts in numeric order. Do not skip ahead.

1. `Prompt-01-Refine-editorial-workspace-shell-and-cross-region-cohesion.md`
2. `Prompt-02-Finish-publisher-tokenization-and-delete-stale-visual-css-debt.md`
3. `Prompt-03-Replace-pseudo-iconography-and-harden-toolbar-avatar-microinteractions.md`
4. `Prompt-04-Close-preview-readiness-authoring-trust-loop.md`
5. `Prompt-05-Finish-team-and-gallery-editorial-management-surfaces.md`
6. `Prompt-06-Close-author-facing-label-governance-and-selector-accessibility.md`

## Global rules for every prompt

- Work in the live local HB Intel repo.
- Treat the live `main`-aligned implementation as the source of truth.
- Scrub the full affected seam before making changes.
- Verify that referenced files, exports, and symbols have not drifted before editing.
- Do **not** re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Preserve working data contracts, workflow logic, persistence invariants, and orchestration unless the prompt explicitly instructs a bounded change to them.
- Do not make unrelated code changes.
- Prove closure before moving to the next prompt.
- Respect:
  - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
  - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` **only** where homepage-derived primitives or stack choices are intentionally reused
- Do not defer known Wave 01 work into “future cleanup,” “later hardening,” or “follow-up polish.”

## Package support documents

- `Plan-Summary.md`
- `Prompt-Change-Log.md`
- `Dependency-Map.md`
- `Validation-Strategy.md`
- `Scope-Boundary-Notes.md`

