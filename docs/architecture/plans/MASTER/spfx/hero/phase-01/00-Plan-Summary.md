# 00 — Plan Summary

## Objective

Evolve `hbSignatureHero` into a host-aware dual-behavior hero that preserves the current HBCentral flagship homepage experience unchanged while enabling dynamic article rendering in non-HBCentral article contexts.

## Recommendation

**Structural redesign with thin mode-specific adapters over shared lower-level seams.**

This is not a full replacement.
This is not a simple prop extension.

## Why

The current `HbSignatureHero` is a locked homepage identity surface with a deliberately minimal contract.
Adding article title, subheading, author, metadata, and publish details directly into that homepage adapter would weaken the homepage doctrine lock and create long-term architectural drift.

## Work sequence

### Closure Unit 1
Lock HBCentral homepage mode in code.

### Closure Unit 2
Introduce article-mode contract and renderer.

### Closure Unit 3
Wire shared author identity and photo resolution seam.

### Closure Unit 4
Extend shell/property-pane/runtime inputs for article mode.

### Closure Unit 5
Add stories, harness coverage, visual proof, and final validation.

## Expected end state

### Homepage mode
- HBCentral only
- Current output preserved
- Current minimal identity surface preserved

### Article mode
- Non-HBCentral only
- Supports:
  - primary image
  - title
  - subheading
  - author name
  - author photo
  - published date
  - published time
  - optional metadata/labels

## Locked constraints

- HBCentral cannot be forced into article mode.
- Article mode cannot leak homepage-only assumptions.
- Kudos runtime modules must not become article dependencies.
- Shared identity/photo logic is reusable; Kudos domain logic is not.

## Primary risks to prevent

- Prop-bloat in the homepage adapter
- Hidden coupling to Kudos
- Article-mode behavior accidentally appearing on HBCentral
- Confused ownership between shell/runtime/config/model/rendering
- Storybook or harness coverage lagging behind implementation
