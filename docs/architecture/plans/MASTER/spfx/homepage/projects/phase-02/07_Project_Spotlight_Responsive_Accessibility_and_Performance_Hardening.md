# Prompt 07 — Project Spotlight Responsive, Accessibility, and Performance Hardening

## Objective

Harden the polished Project Spotlight implementation across breakpoints, accessibility behaviors, and practical SharePoint performance considerations.

---

## Required work

### A. Responsive refinement
Ensure the polished hierarchy survives across:
- desktop
- tablet
- mobile

Requirements:
- featured item always remains first and dominant
- supporting rail adapts cleanly
- team detail behavior remains correct
- image crops remain intentional

### B. Accessibility hardening
Validate and fix as needed:
- keyboard focus order
- focus-visible states
- escape/close behavior
- dialog/bottom-sheet semantics
- non-hover dependency
- alt and fallback behavior
- touch target minimums

### C. Performance realism
Harden practical runtime behavior:
- avoid unnecessary layout shift
- avoid heavy effects that are not justified
- ensure image handling remains efficient
- keep the surface SharePoint-hosted realistic

### D. Motion discipline
Ensure motion remains premium but restrained and consistent with doctrine.

---

## Deliverables

### 1. Files changed
### 2. Breakpoint validation summary
### 3. Accessibility validation summary
### 4. Performance summary
### 5. Validation
At minimum:
- typecheck/build
- breakpoint proof
- accessibility proof
- no obvious perf regression introduced by the polish work

---

## Hard constraints

- Do not introduce novelty animation.
- Do not undo the flagship hierarchy in order to simplify mobile.
