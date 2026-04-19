# Audit-06 — Required Implementation Waves

## Wave 1 — Runtime truth and governance cleanup

### Goal

Make the homepage runtime authority unmistakable and remove governance ambiguity created by the rail-to-launcher transition.

### Included prompts

- Prompt-01
- Prompt-02
- Prompt-07

### Closure standard

- no stale authority language remains in the active homepage path
- homepage launcher count/governance rules have a single explicit authority
- homepage-only dead knobs are retired, quarantined, or explicitly documented and tested

---

## Wave 2 — Model and semantics rebuild

### Goal

Carry enough semantics into the launcher family to support a premium outcome.

### Included prompts

- Prompt-03
- Prompt-04

### Closure standard

- the launcher model is no longer limited to the old five-field bottleneck
- icon mapping is service-driven first
- link semantics are preserved precisely enough for correct runtime behavior
- grouping metadata survives where useful

---

## Wave 3 — Surface redesign

### Goal

Replace the weak equal-width chip pattern and flat overflow panel with a stronger launcher family.

### Included prompts

- Prompt-05
- Prompt-06
- Prompt-08

### Closure standard

- primary launcher units no longer look inflated in sparse states
- overflow reads like a secondary launcher, not a dump list
- labels remain clear, truncated states are handled credibly, and accessibility is stronger than before

---

## Wave 4 — Host-fit stabilization and proof

### Goal

Lock the redesigned launcher into the real homepage host environment and make regression detectable.

### Included prompts

- Prompt-09
- Prompt-10

### Closure standard

- wrapper placement is unchanged and stable
- no new entry-stack overflow or shell-fit regressions are introduced
- tests and hosted-proof steps cover the decisions that matter most
