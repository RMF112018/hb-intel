# Prompt 13A — Repo Truth, Scope Lock, and Remediation Gate

## Objective

Audit current repo truth and create the Procore data-layer remediation scope lock for Wave 13A-13F.

## Required Work

1. Capture branch, HEAD, worktree status, and lockfile MD5.
2. Verify current Wave 13 Buyout Log status against repo truth.
3. Inspect governing docs, System of Record Matrix, integrations schema, Wave 8-13 docs, and HB Central Projects schema.
4. Produce a scope lock identifying exact files/families allowed in 13B-13F.
5. Produce a module remediation target matrix for Waves 1-13.
6. Do not change runtime source in this prompt.

## Allowed Changes

Docs and JSON artifacts only.

## Validation

Run Prettier on touched docs/JSON and validate JSON artifacts.
