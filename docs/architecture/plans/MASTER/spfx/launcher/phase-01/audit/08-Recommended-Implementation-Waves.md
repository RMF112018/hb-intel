# Recommended Implementation Waves

## Wave 01 — Mobile correction and top-band footprint reduction

### Scope
- Fix the phone runtime/CSS contract mismatch
- Reduce mobile launcher height
- Tighten entry-stack spacing around the launcher
- Re-capture hosted proof for phone portrait, phone large portrait, and short-height states

### Why first
This is the most visible quality failure and the cleanest immediate win.

### Exit criteria
- No unintended shelf padding on phone
- Handheld launcher is materially shorter
- First shell lane begins sooner on phone
- Hosted screenshots prove stable behavior

---

## Wave 02 — Overflow redesign and grouped secondary launcher

### Scope
- Replace universal sheet-only overflow posture
- Reintroduce grouped secondary IA
- Make desktop/tablet overflow lighter and faster than mobile modal behavior
- Preserve accessibility and focus correctness

### Why second
This is the largest remaining UX gap once the mobile problem is corrected.

### Exit criteria
- Display-class-appropriate overflow behavior exists
- Secondary tools are easier to scan and trust
- Desktop overflow no longer feels like a blunt modal interruption

---

## Wave 03 — Productize the launcher surface and lock closure proof

### Scope
- Rework desktop/tablet launcher hierarchy
- Improve visible primary/secondary semantics
- Update tests to new contract
- Record hosted breakpoint evidence and packaged proof

### Why third
This closes the gap between “improved launcher” and “flagship homepage launch surface.”

### Exit criteria
- Launcher reads as productized, not merely styled
- Tests match the intended contract
- Hosted/package proof is complete
- Acceptance can be defended against the scorecard
