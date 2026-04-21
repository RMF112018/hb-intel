# Project Portfolio Spotlight — Surface Flattening Remediation Package

This package is a tight, forceful implementation package for the currently deployed **Project Portfolio Spotlight** surface on the HB Central homepage.

## Objective

Eliminate the current **card-within-a-card** composition and rebuild the Spotlight so it reads as **one integrated premium homepage surface**, not a large container holding smaller white cards.

## Repo truth

- Repository: `RMF112018/hb-intel`
- Branch: `main`
- Deployment evidence: the currently deployed `.sppkg` produces the nested-card visual shown in the screenshot supplied by the user.
- The current runtime architecture is already directionally correct:
  - thin SPFx consumer
  - shared ui-kit Spotlight surface
  - explicit layout modes
  - explicit details/history disclosures
- The failure is primarily **visual shell language and internal surface composition**, not the existence of the mode system.

## Governing authority

Treat these as binding:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/`

## High-level conclusion

The current surface still violates doctrine by reading as:
- nested bordered cards
- repeated white-card containers
- generic enterprise composition inside a premium homepage zone

The core fix is to **flatten the interior surface hierarchy** while preserving:
- the thin SPFx wrapper
- the data normalization path
- the explicit layout-mode system
- the explicit details/history disclosure model

## Execution order

1. Prompt-01 — flatten the Spotlight shell and remove the nested featured card identity
2. Prompt-02 — integrate the history rail into the parent surface instead of treating it as another inset card
3. Prompt-03 — close doctrine gaps around tokens, hardcoded values, and premium primitive usage
4. Prompt-04 — validate packaged hosted output and prove visual closure

## Non-negotiable rules

- Do not broaden scope into unrelated homepage work.
- Do not rewrite the data pipeline unless required by the visual objective.
- Do not remove the mode system or disclosure model.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not stop at “looks better locally.” Closure requires repo-truth proof and packaged hosted validation.
