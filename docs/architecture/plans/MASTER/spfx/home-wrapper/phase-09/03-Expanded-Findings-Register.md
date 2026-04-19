# Expanded Findings Register

## Scoring
- **Critical** = blocks target-state shell quality or causes structural inconsistency
- **High** = materially weakens the homepage experience or closure confidence
- **Medium** = weakens maintainability, precision, or future-proofing

---

## Finding 01 — Split entry-experience measurement truth
**Severity:** Critical

### Current condition
The shell computes authoritative width using the entry-stack envelope and shell insets, while the launcher band also resolves its own responsive behavior from container measurement.

### Why this is a problem
That creates two different responsive decision centers inside one composed entry experience. Even if they are often close, they are not guaranteed to remain aligned as width rules, overflow budgets, shell padding, or host wrappers evolve.

### Practical UX risk
- launcher visible counts can drift from shell density assumptions,
- breakpoint behavior can diverge,
- shell and launcher can “feel” like separate systems,
- and closure becomes harder to prove.

### Root cause
The repo has a shell container authority seam, but it does not yet elevate that into a shared entry-experience measurement contract consumed by both shell and launcher.

### Required closure
A single authoritative entry-experience measurement and breakpoint context must drive:
- launcher visible-count logic,
- shell state,
- first-lane budgeting,
- and density behavior.

---

## Finding 02 — Active shell layout grammar is too narrow
**Severity:** Critical

### Current condition
The shell runtime is real, but the active layout outcomes are still dominated by:
- stacked full-width bands, and
- one fixed paired pattern.

### Why this is a problem
A premium homepage shell needs a governed set of compositional archetypes:
- paired spotlight + utility,
- editorial triptych,
- asymmetrical feature lane,
- compact secondary strip,
- and mixed-density module groupings.

The current grammar does not support enough of that.

### Product consequence
The rendered homepage remains visually conservative and compositionally timid, especially on wider desktop surfaces.

### Root cause
The shell’s type system and band resolver vocabulary are still too constrained. The preset does not have enough expressive power, and the band renderer does not expose a richer governed recipe set.

### Required closure
Expand the shell grammar into named band recipes with explicit fit rules, constraints, and validation.

---

## Finding 03 — Hosted-surface shell-fit contracts are underdeveloped
**Severity:** High

### Current condition
The occupant registry includes width and eligibility metadata, but richer nested-mode capabilities are not materially active. Compact/summary-collapse support is effectively dormant.

### Why this is a problem
Doctrine requires hosted homepage applications to declare their narrowest stable nested mode and whether they can safely participate in paired or constrained shell slots.

Width metadata alone does not provide that assurance.

### Architectural consequence
The shell can compute layout intent without having enough trustworthy information about what each hosted application can actually sustain.

### Required closure
Each occupant must declare a shell-fit contract that includes:
- narrowest stable mode,
- supported nested render modes,
- paired participation rules,
- fallback behavior,
- and any protected layout constraints.

---

## Finding 04 — First-lane governance is stronger than the output, but still incomplete
**Severity:** Medium

### Current condition
There is first-lane resolution logic and eligible occupants, but the closure standard for vacancy handling, promotion, and fallback confidence needs strengthening.

### Why this matters
The first visible shell lane has outsized impact on:
- perceived quality,
- density,
- visual rhythm,
- and the usefulness of the homepage above the fold.

If the first lane can degrade into awkward emptiness, weak secondary placement, or timid promotion behavior, the shell loses much of its value.

### Required closure
The first lane needs explicit ranking, vacancy handling, promotion rules, and proof behavior rather than implicit “best effort.”

---

## Finding 05 — Launcher band is improved, but not yet fully governed as part of the same shell system
**Severity:** High

### Current condition
The launcher band is no longer a primitive quick-links row. It does partition items and overflow intelligently. But it still behaves as a semi-adjacent system.

### Why this is a problem
The homepage utility band is part of the entry experience. It should not only look coordinated; it should be **governed** by the same width and breakpoint truth as the shell.

### Required closure
The launcher band must consume shared entry-state truth and publish evidence that its visible-primary and overflow behavior remains aligned with shell density decisions.

---

## Finding 06 — Width use is still too timid on large desktop surfaces
**Severity:** High

### Current condition
The rendered screenshots show large amounts of unused horizontal space and a narrow, centered content posture.

### Why this is a problem
Repo doctrine explicitly calls for confident width use, container-aware composition, and avoidance of timid centered-card experiences on large host surfaces.

### Product consequence
The homepage reads as smaller and less capable than it really is.

### Root cause
A combination of conservative envelope strategy, cautious band grammar, stack-heavy preset behavior, and shell density choices.

### Required closure
Large desktop surfaces must use width more assertively while preserving reflow safety and host resilience.

---

## Finding 07 — Closure proof is not yet strong enough
**Severity:** High

### Current condition
The repo has data attributes, diagnostics, and governance seams. That is useful. But the black-box evidence standard required for homepage closure is not formalized enough.

### Why this matters
A shell this host-sensitive cannot be closed by “looks better now” judgments. It needs proof across width classes, zoom states, and responsive transitions.

### Required closure
Add a validation harness and evidence matrix that proves:
- no horizontal overflow,
- no broken reflow,
- consistent shell/launcher entry state,
- no invalid paired slots,
- and stable fallback behavior.

---

## Finding 08 — Preset governance and config bounds need hardening before the shell grammar expands
**Severity:** Medium

### Current condition
The repo already has preset and validation seams, but the current shell vocabulary is limited enough that config sprawl risk is suppressed mainly by lack of expressiveness.

### Why this matters
Once richer layout recipes are added, ungoverned presets can quickly become a second source of layout instability.

### Required closure
Expand shell expressiveness and validation together. Do not let preset flexibility outrun governance.
