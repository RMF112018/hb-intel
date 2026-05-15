# 09 — Implementation Risk Register and Burden of Proof

## Risk 01 — destabilizing the working pending path

### Risk

The existing Adobe Sign pending action queue now works. Broad generalization or refactoring could reintroduce outages.

### Required mitigation

- preserve pending route and DTO semantics;
- use a sibling completed lane;
- add regression tests that prove pending behavior remains unchanged.

## Risk 02 — false completed semantics

### Risk

The UI could accidentally imply user-completed actions rather than visible completed agreements.

### Required mitigation

- lock definition and copy;
- avoid actor-of-completion language;
- use accurate date labels.

## Risk 03 — adapter-only post-filter scan

### Risk

If the backend fetches mixed agreements and filters completed records after retrieval, the view could be false-empty or unbounded.

### Required mitigation

- require provider-side completed/date/sort query syntax;
- stop implementation if exact syntax cannot be confirmed.

## Risk 04 — duplicated transport clients

### Risk

Adding a second Adobe HTTP client could duplicate parser, timeout, allowlist, and telemetry behavior.

### Required mitigation

- keep one low-level search transport;
- introduce bounded query intent.

## Risk 05 — home-load latency regression

### Risk

Adding completed preview data to the home envelope would add a second Adobe request to dashboard cold load.

### Required mitigation

- no completed home projection;
- lazy fetch only on first `Completed` selection.

## Risk 06 — layout instability in header toggle

### Risk

The new dynamic title could wrap awkwardly or break the card header layout.

### Required mitigation

- style selected and deselected labels deliberately;
- verify narrow responsive behavior;
- use UI tests and visual structure assertions where possible.

## Risk 07 — scoped route failure collapsing healthy pending view

### Risk

A completed route failure might incorrectly degrade the entire Adobe Sign card.

### Required mitigation

- completed failure is panel-scoped when overall Adobe source is otherwise data-capable;
- card-level auth/config/unavailable states remain governed by existing source status.

## Risk 08 — undocumented wire syntax

### Risk

The exact provider filter shape may require live/current confirmation.

### Required mitigation

- Prompt 01 verifies syntax;
- later prompts consume that lock;
- no improvisation.

## Burden of proof

The local agent must prove:

1. the exact completed query shape was confirmed before coding;
2. pending route/card behavior remains intact;
3. completed route is actor-bound, bounded, and read-only;
4. completed UI is lazy-loaded and panel-scoped;
5. docs reflect the final feature;
6. all required commands pass;
7. lockfile checksum is unchanged;
8. no prohibited files or deployment scope were touched.
