# 05 — Recommended Verification Flow

## Goal

Separate source-level truth from hosted-runtime truth.

## Step 1 — Prove source behavior locally

Instrument or inspect the runtime data attributes exposed by the shell:

- `data-shell-entry-state`
- `data-shell-width`
- `data-shell-width-authoritative`
- `data-shell-width-inline-inset-total`
- `data-shell-columns`
- `data-shell-band-pairing-allowed`
- `data-shell-band-pairing-reason`

Validate at minimum:

- a `tablet-landscape` usable width
- a mid-band `standard-laptop` usable width
- a high-band `standard-laptop` usable width
- a true ultrawide usable width

## Step 2 — Prove the package is fresh

Follow `docs/how-to/verify-hb-intel-homepage-sppkg.md`:

- rebuild the package
- confirm version alignment
- confirm the homepage package proof artifacts
- deploy the fresh `.sppkg`

## Step 3 — Prove the hosted page is the right authored surface

Confirm:

- the page contains exactly one HB Homepage webpart
- the webpart is in full-width mode
- the page is not still serving an older package

## Step 4 — Capture hosted runtime proof

At each target viewport, capture:

- screenshot of the hosted row composition
- DevTools showing `data-shell-entry-state`
- DevTools showing each band's `data-shell-columns`
- DevTools showing each band's `data-shell-band-pairing-reason`

## Step 5 — Close only when source and hosted proof agree

Closure requires both:

1. repo source supports the locked target
2. hosted runtime proves the expected paired rows are actually rendering
