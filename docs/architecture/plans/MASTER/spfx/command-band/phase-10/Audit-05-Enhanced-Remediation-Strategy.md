# Audit-05 — Enhanced Remediation Strategy

## Strategic posture

The launcher should be rebuilt as a **stronger surface family**, not patched as isolated symptoms.

The correct posture is:

- preserve strong wrapper/data seams
- expand the launcher model where needed
- rebuild the weak primitives
- reconcile governance drift immediately
- prove hosted closure explicitly

## Remediation principles

### 1. Preserve what is actually good

Do not destabilize:

- wrapper-owned entry-stack placement
- canonical list-host resolution
- data cache behavior
- audience/schedule/device filtering
- menu vs sheet mode choice at the macro level
- runtime surface markers

### 2. Restore semantic richness before over-polishing the UI

The launcher surface should not be forced to guess:

- what icon to show
- whether a link should open in a new tab
- whether an overflow item belongs to a group
- how a tool should be represented

Those semantics should be carried through the model explicitly.

### 3. Separate governance cleanup from surface redesign

A weak surface family and a weak contract/governance posture are related but not identical. The package therefore separates:

- contract cleanup
- adapter/model expansion
- chip primitive redesign
- overflow redesign
- count-rule reconciliation
- final host-fit stabilization and proof

### 4. Preserve compact launcher persona

The correct end state is **not** a mini dashboard or a card strip.

The correct end state is a compact, command-oriented, service-identity-rich launcher with a polished overflow extension.

### 5. Use external research where it helps concrete decisions

Research materially supports:

- container-aware layout decisions
- grouped overflow behavior
- icon-with-label semantics
- compact command density
- focus and target-size rigor

The research should influence implementation details, not be pasted performatively.

## Recommended future-state characteristics

### Primary row

- compact, visually strong, non-generic launcher units
- service-driven iconography
- labels remain visible and quickly scannable
- low-count states do not overgrow
- count rules remain binding and inspectable

### Overflow

- menu on desktop/tablet, sheet on handheld or short-height when justified
- grouped or otherwise more structured than a flat dump list
- stronger service identity than the current plain list treatment
- compact but premium, not decorative

### Model and adapter

- explicit icon identity
- explicit link semantics
- optional grouping metadata
- enough shape for future proofs and tests
- no unnecessary re-introduction of bloated historical render models

### Proof standard

- tests for semantics and counts
- runtime markers still inspectable
- hosted rebuild/cutover checklist
- final verification that the homepage path, not the legacy rail path, governs the result
