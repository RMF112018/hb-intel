# 04 — Enhanced Issue Register

## Severity key
- **P1** = required for closure
- **P2** = strong hardening / regression prevention required now
- **P3** = documentation / proof discipline required for honest closure

---

## I1 — No explicit homepage flagship surface contract
**Severity:** P1  
**Scope:** Architecture / shared UI contract

### Current condition
`HbcPriorityRailSurface` variants only differentiate urgency and layout. There is no explicit homepage-flagship context contract.

### Why that is inadequate
Without a named flagship contract, the homepage can regress toward whatever the generic shared surface happens to look like.

### Required end state
Add an explicit homepage flagship context / variant / mode (name chosen by the agent) that the homepage-facing rail uses intentionally.

### Closure proof
- explicit prop / variant / context exists
- wrapper/homepage path uses it intentionally
- non-homepage mountability remains intact

---

## I2 — Shared rail surface still reads as a bordered card
**Severity:** P1  
**Scope:** Shared surface architecture and styling

### Current condition
The root surface uses a lightly tinted background, rounded radius, and visible border; the overall rhythm still reads as a utility card.

### Why that is inadequate
The homepage doctrine requires a top-band command layer, not a cautious module card floating in canvas space.

### Required end state
Rebuild the flagship surface language so it reads first as:
- command band
- operational launcher
- premium utility strip

### Closure proof
- bordered-card reading is materially gone
- grouped sections and action scan-speed improve
- premium hierarchy is obvious in hosted screenshots

---

## I3 — Overflow behavior is functionally governed but under-hardened
**Severity:** P1  
**Scope:** Interaction model / accessibility

### Current condition
Overflow supports inline/menu/sheet strategies, but the current implementation does not fully cash in the already-installed premium stack for anchored, collision-safe, or tall-list behavior.

### Why that is inadequate
Overflow is part of the core command-band experience. Weak overflow makes the whole surface feel second-tier.

### Required end state
- retain governed overflow
- improve interaction quality, focus behavior, dismissal behavior, and tall-list handling
- use existing `@floating-ui/react` and/or `@radix-ui/react-scroll-area` where justified

### Closure proof
- keyboard flow proven
- escape / dismiss / focus behavior proven
- tall overflow lists remain usable
- compact and touch states remain safe

---

## I4 — Wrapper envelope reinforces a nested-panel reading
**Severity:** P1  
**Scope:** Wrapper composition / spacing

### Current condition
The entry-stack root mirrors shell width and density padding. That preserves alignment, but it also visually contains the rail.

### Why that is inadequate
The rail needs to read as a top-band action layer, not as a shell sibling that happens to share the same padded content rail.

### Required end state
Recalibrate the entry-stack envelope so hero -> actions -> shell feels intentionally staged and the rail claims more page-canvas authority.

### Closure proof
- wrapper still owns rail placement
- shell still begins after rail
- first-lane visibility preserved
- hosted result no longer reads as “panel inside larger panel”

---

## I5 — Breakpoint and presentation machinery need stronger regression proof
**Severity:** P1  
**Scope:** Presentation normalization / tests / diagnostics

### Current condition
The repo already has strong breakpoint and presentation infrastructure, but the attached packages did not require enough proof that the flagship rail stays within visible-action budgets and first-view rules.

### Why that is inadequate
The most likely regression after a visual redesign is not compilation failure; it is silent budget drift.

### Required end state
- durable tests or equivalent proof around presentation normalization and visible-action budgets
- explicit review of compact, tablet, and short-height states
- easier-to-read diagnostics or data attributes where useful

### Closure proof
- relevant tests added/updated
- breakpoint matrix reviewed
- no regression in shell/rail separation

---

## I6 — Hosted closure standard is still too soft
**Severity:** P1  
**Scope:** Validation / deployment proof

### Current condition
The previous package required hosted validation, but did not define enough pass/fail detail.

### Why that is inadequate
Weak validation language allows aesthetically weak results to be misclassified as finished.

### Required end state
Hosted validation must explicitly cover:
- view mode
- edit mode
- standard desktop
- higher zoom
- constrained tablet-like width
- console cleanliness
- overflow state proof
- first-view relationship of hero / actions / shell

### Closure proof
- screenshot set captured
- console proof captured
- remaining defects listed plainly if any remain

---

## I7 — Documentation and scorecards can drift ahead of truth
**Severity:** P3  
**Scope:** Documentation / closure discipline

### Current condition
Older scorecard logic can be mistaken for closure even when hosted proof remains open.

### Why that is inadequate
Package quality is degraded when closure wording gets ahead of actual proof.

### Required end state
Refresh scorecards / notes / README references only after implementation and hosted validation are complete.

### Closure proof
- updated docs reflect actual implemented condition
- no stale “done” language survives

---

## I8 — The previous prompt package was under-decomposed
**Severity:** P2  
**Scope:** Package design quality

### Current condition
The earlier package was helpful, but too few prompts carried too much scope.

### Why that is inadequate
Large prompts invite shallow local-agent execution and weak proof.

### Required end state
Use a bounded prompt set with separate implementation units for:
- variant contract
- surface rebuild
- overflow hardening
- wrapper envelope
- breakpoint/test proof
- documentation refresh
- hosted validation

### Closure proof
- each prompt is executable, reviewable, and closure-oriented
