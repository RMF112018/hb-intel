# Project Sites Remediation Prompt Package

This package converts the audit findings into bounded prompts for a local code agent.

## Included Files
- `Plan-Summary.md`
- `Prompt-01-stabilize-shell-mount-runtime.md`
- `Prompt-02-stabilize-layout-mode-derivation.md`
- `Prompt-03-remove-forced-grid-remounts.md`
- `Prompt-04-stabilize-data-derivations.md`
- `Prompt-05-add-regression-coverage.md`
- `Prompt-06-align-manifest-and-drift-hardening.md`

## Recommended Usage
Execute these prompts in order. Do not skip Prompt 01 or Prompt 02; those are the highest-leverage stability closures.

## Intent
These prompts are tightly bounded. They are not feature prompts. They are closure prompts for runtime durability, render stability, and host-safe SharePoint behavior.
