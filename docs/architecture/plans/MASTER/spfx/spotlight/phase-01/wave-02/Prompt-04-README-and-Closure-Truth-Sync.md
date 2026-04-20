# Objective

Sync the Spotlight README and any directly relevant closure notes so the repo describes the actual final implementation truth.

# Governing repo authority

Use these as governing authority:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

# Inspect these files and seams first

- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/README.md`
- any Spotlight-specific migration or completion note that now needs correction
- the final updated Spotlight implementation files

Do not re-read files that are still in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.

# Current gap to close

The README documents the thin consumer boundary well, but it does not yet describe the final layout-mode/disclosure contract that the redesigned Spotlight should have.

# Required implementation outcome

Update documentation so it accurately describes:
- ownership boundaries
- layout modes
- details disclosure behavior
- history disclosure behavior
- responsive/usable-space rules
- story/validation coverage if relevant

# Proof of closure

Provide:
- which docs changed
- what implementation truth was added or corrected
- files changed

# Constraints

- Do not leave stale claims in place.
- Do not document features that were not actually implemented.
- Keep docs specific to Spotlight scope.
