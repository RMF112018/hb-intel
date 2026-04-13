# 00 — Plan Summary

## Objective

Create a durable governance model that forces all homepage webparts to achieve the same **level of detail, sophistication, code quality, backend discipline, and runtime maturity** as the HB Kudos public webpart, while still remaining purpose-fit for their own domain and persona.

## Governing authority

This package is governed by:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Those doctrine files define the rules for SPFx homepage work in `apps/hb-webparts`.
This benchmark package translates those rules into benchmark standards, delivery gates, scoring, and closure discipline.

## Strategic posture

The correct strategy is not to ask each new homepage effort to “be better.”
The correct strategy is to make homepage quality **governed, measurable, auditable, and enforceable** without collapsing all homepage webparts into the same visual product.

## Core decisions

### 1. Doctrine decision
The two SPFx doctrine files are the primary authority for homepage webpart development in `apps/hb-webparts`.

### 2. Benchmark decision
The HB Kudos public-facing webpart is the homepage benchmark for implementation maturity and execution quality.

### 3. Persona-fit differentiation decision
Benchmark quality must **not** produce identical webparts with different names.
Each homepage webpart must express its own persona based on its content family while staying inside a shared HB brand system.

### 4. Quality translation decision
Kudos quality must be translated into explicit categories, standards, and acceptance gates.

### 5. Delivery decision
Every homepage webpart update must begin with a doctrine-aware benchmark-gap audit and end with proof-based closure.

### 6. Enforcement decision
No homepage webpart may bypass the governance workflow because of urgency, scope size, or apparent simplicity.

## Required workstreams

### Workstream A — Doctrine alignment
Make the two doctrine files explicit governing authority for all benchmark work.

### Workstream B — Benchmark formalization
Document what makes Kudos the benchmark and break it into reusable standards.

### Workstream C — Persona-fit design governance
Force each homepage webpart effort to define:
- content persona
- intended emotional/functional tone
- acceptable differences from Kudos
- required brand/design symmetry with the rest of `hb-webparts`

### Workstream D — Conformance scoring
Create a matrix that rates each homepage webpart against the benchmark by category.

### Workstream E — Delivery workflow
Require a fixed implementation sequence for all homepage updates:

- doctrine review
- benchmark audit
- persona lock
- decision locks
- implementation prompts
- hosted validation
- closure review

### Workstream F — Acceptance enforcement
Require pass/fail closure criteria, screenshots, runtime proof, defect logging, and explicit confirmation that the result is benchmark-grade **without** becoming a clone of another homepage webpart.

## Recommended operating model

For every homepage webpart change:

1. Perform a repo-truth audit of the target webpart.
2. Review the two doctrine files first.
3. Define the target webpart’s persona and intended surface tone.
4. Compare the target against the Kudos benchmark categories.
5. Produce a gap register.
6. Produce a remediation package that addresses the gaps.
7. Validate in hosted/runtime conditions.
8. Close only when doctrine compliance, benchmark quality, and persona-fit standards are all met.

## Closure standard

A homepage webpart update is only complete when:

- it complies with the two doctrine files
- its purpose-fit UX is premium and complete
- its persona is appropriate to its content and not a cloned surface identity
- its data seams are disciplined and explicit
- its loading/error/empty states are deliberate
- its host-runtime behavior is proven
- its accessibility behavior is credible
- its shared primitive usage is appropriate
- its implementation is supported by validation artifacts
- its benchmark score meets the required threshold
