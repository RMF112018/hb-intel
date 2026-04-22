# 03 — Launcher Application and Integration Architecture

## Architecture objective

Create a new launcher implementation as a **clean isolated application surface** that is integrated into the homepage through a single cutover seam.

## Required architecture posture

- Fresh build
- New component tree
- New styling contract
- New drawer contract
- New trigger contract
- No copy-forward of current launcher render logic

## Approved preservation seams

The implementation may preserve and/or adapt:
- homepage integration seam
- data adapter seam
- item normalization seam
- icon asset registry
- shell-fit / breakpoint governance where still correct

## Prohibited carry-forward

The new implementation must not copy:
- old row JSX structure
- old drawer JSX structure
- old grouped-section logic
- old drawer hint copy
- old tile geometry code
- old overflow trigger composition
- old CSS modules except for asset references if needed

## Integration rule

The homepage should consume the new launcher through a **single imported surface boundary**.
The homepage wrapper should not become the place where launcher UI is authored in detail.

## Data-host neutrality

This design package does not define or require:
- a specific SharePoint site
- a specific list host
- a specific site-relative URL

The implementation may be wired to whichever authoritative configuration/data source is approved at the build-and-cutover phase.
