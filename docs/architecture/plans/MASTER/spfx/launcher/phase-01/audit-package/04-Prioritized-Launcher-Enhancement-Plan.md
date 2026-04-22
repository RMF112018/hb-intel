# Prioritized Launcher Enhancement Plan

## Priority 1 — Cleanly retire legacy launcher ambiguity
### Gap closed
Legacy launcher family still exists and carries stale version truth.

### Implementation direction
- decide whether `packages/ui-kit/src/HbcHomepageLauncher/*` is:
  - retired
  - compatibility-only
  - or still strategically supported
- if compatibility-only, move it behind explicit legacy naming and comments
- stop exporting it from the main homepage barrel unless there is a hard dependency
- remove or clearly quarantine stale constants

### Impact
- improves cutover truth
- reduces repo ambiguity
- strengthens runtime/package proof
- lowers maintenance risk

### Timing
Implement now

### Work type
Structural cleanup

---

## Priority 2 — Align package/runtime/manifest truth
### Gap closed
Version and descriptive truth are still partially split across:
- dedicated launcher package
- runtime constants
- homepage manifests
- package-solution metadata

### Implementation direction
- choose one authoritative launcher-boundary version strategy
- align all manifest/package description text
- either align `packages/homepage-launcher/package.json` or explicitly document why it stays decoupled
- add one proof test that asserts all intended version/description seams remain in lockstep

### Impact
- improves auditability
- reduces deployment ambiguity
- makes hosted DOM proof more trustworthy

### Timing
Implement now

### Work type
Refinement with light structural cleanup

---

## Priority 3 — Rebuild the dedicated launcher surface onto a more governed styling model
### Gap closed
The dedicated package currently relies too heavily on one-off CSS values.

### Implementation direction
- introduce launcher-local semantic tokens or governed primitive wrappers
- reduce raw color / spacing / radius / shadow literals
- normalize tile, handheld trigger, and drawer shell through a clearer variant model
- make the row and drawer feel like one product family, not just one CSS file

### Impact
- raises doctrine compliance
- improves maintainability
- materially increases flagship polish

### Timing
Implement now

### Work type
Structural refinement

---

## Priority 4 — Harden drawer accessibility and interaction semantics
### Gap closed
Dialog behavior is working but incomplete.

### Implementation direction
- add focus trap
- add focus restoration to the opening trigger
- set deterministic initial focus
- add `prefers-reduced-motion` handling
- consider moving the drawer to a governed dialog/sheet primitive rather than bespoke event handling

### Impact
- raises accessibility score
- makes handheld and keyboard use safer
- removes a major blocker to flagship acceptance

### Timing
Implement now

### Work type
Targeted structural hardening

---

## Priority 5 — Consolidate launcher proof into one closure path
### Gap closed
Good evidence exists, but it is not easy to run as one obvious launcher-closure command.

### Implementation direction
- add a launcher-specific verification script or runner
- include:
  - host-fit proof
  - handheld closure proof
  - productization capture
  - live SharePoint handheld proof where env permits
- standardize artifact output directories and naming

### Impact
- improves closure confidence
- helps local code agent and human reviewers
- reduces repeated audit effort

### Timing
Implement after priorities 1–4

### Work type
Refinement / tooling closure

---

## Priority 6 — Final hosted screenshot review
### Gap closed
Visual acceptance is still indirect in this pass.

### Implementation direction
- rerun hosted capture
- review row parity
- review `More Tools` tile parity
- review drawer width, spacing, tray feel, and handheld trigger
- accept only after fresh images match doctrine and benchmark posture

### Impact
- provides final visual proof
- turns “source looks strong” into “hosted result is accepted”

### Timing
Implement last

### Work type
Validation / proof
