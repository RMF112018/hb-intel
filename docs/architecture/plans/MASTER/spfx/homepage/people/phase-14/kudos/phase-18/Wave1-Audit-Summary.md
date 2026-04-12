# HB Kudos Wave 1 — Audit Summary

## Wave 1 findings addressed by this package

### 1. Direct doctrine violation: Unicode / pseudo-icon usage remains in the public surface
The homepage doctrine explicitly prohibits Unicode / pseudo-icon substitutions where a real premium icon system is expected.
HB Kudos still uses trophy, spark, thumbs-up, chevron, arrow, and similar text-glyph patterns in homepage-facing UI.

### 2. Token discipline is materially weak
The current implementation relies too heavily on:
- raw hex values
- raw rgba values
- hardcoded pixel spacing
- local visual definitions not clearly derived from shared theme semantics

### 3. The styling layer is the single biggest UI-quality liability
The current UI layer leans on:
- large injected `<style>` blocks
- large inline style objects
- ad hoc hover/focus/material treatments
- weakly formalized variants

### 4. The surfaces import from `@hbc/ui-kit/homepage`, but mostly bypass the spirit of the shared system
The current implementation is technically inside the homepage import boundary, but too much of the real visual language and structure is still driven by one-off local styling rather than a disciplined surface-family system.

### 5. The mandated premium homepage stack is not materially used where it is clearly relevant
The homepage doctrine expects material use of the approved premium stack where it improves iconography, motion, overlays, variants, and compositional quality.
HB Kudos currently underuses that stack in the exact places where it would most improve compliance and maintainability.

## Wave 1 remediation posture

This wave should be completed before any major architecture cleanup or broader UI polish work.
Wave 1 establishes the correct system foundation.
Without it, later work would be built on the wrong UI assumptions.
