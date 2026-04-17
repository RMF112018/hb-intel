# 02 — Shell Issue Gap Register

## Gap register

### Gap 01 — Shell-owned boundary is not explicit enough for future agents
- **Why current treatment is insufficient:**  
  The current package tells the agent to stay shell-only, but it does not define the boundary with enough precision to prevent drift into hosted-surface behavior.
- **Stronger treatment required:**  
  Explicitly define shell-owned vs child-owned seams using exact files, symbols, and ownership statements.
- **Belongs in:**  
  audit framing + implementation prompt

### Gap 02 — Entry-stack policy is implied, not encoded
- **Why current treatment is insufficient:**  
  The breakpoint prompt does not force the creation of a shell-facing contract for:
  - hero height budgets
  - visible action budgets
  - overflow posture
  - first-lane-first-view expectations
  - short-height fallback
- **Stronger treatment required:**  
  Add a dedicated prompt for a typed policy contract and acceptance matrix.
- **Belongs in:**  
  audit framing + implementation prompt

### Gap 03 — Breakpoint work is framed too generically
- **Why current treatment is insufficient:**  
  The repo already has entry states and tests. The missing work is not just state definition, but spec alignment, inspectability, and proof.
- **Stronger treatment required:**  
  Focus on practical shell targets, diagnostics, and closure evidence rather than generic breakpoint setup.
- **Belongs in:**  
  audit framing + implementation prompt

### Gap 04 — Control-panel readiness is treated too broadly and too vaguely
- **Why current treatment is insufficient:**  
  The current package does not distinguish between:
  - what already exists
  - what still needs hardening
  - what must remain protected even when future persisted config is introduced
- **Stronger treatment required:**  
  Add a prompt dedicated to preset hardening, override bounds, normalization, protected/configurable boundaries, and persistence shape closure.
- **Belongs in:**  
  both

### Gap 05 — Production orchestration seam is under-specified
- **Why current treatment is insufficient:**  
  The current package says “establish an orchestration seam” but does not force concrete work across:
  - `mount.tsx`
  - `ReferenceHomepageComposition.tsx`
  - hero/actions/shell shared policy references
- **Stronger treatment required:**  
  Define a shell-facing shared policy seam without redesigning hero or actions internals.
- **Belongs in:**  
  both

### Gap 06 — Harness and proof requirements are not strong enough
- **Why current treatment is insufficient:**  
  The package treats harnessing as one prompt and does not separate:
  - preview path / harness creation
  - automated test extension
  - closure artifact generation
- **Stronger treatment required:**  
  Split harness work from automated test work, and require a breakpoint-by-breakpoint closure matrix.
- **Belongs in:**  
  both

### Gap 07 — Existing test base is not acknowledged
- **Why current treatment is insufficient:**  
  The local code agent could duplicate testing effort or miss the need to extend the current shell test suite.
- **Stronger treatment required:**  
  Require preservation and extension of existing shell tests.
- **Belongs in:**  
  implementation prompt

### Gap 08 — Diagnostics are not treated as a first-class closure seam
- **Why current treatment is insufficient:**  
  The shell already exposes data attributes and warnings, but the current package does not require stable, inspectable diagnostic output for closure proof.
- **Stronger treatment required:**  
  Require inspectable diagnostics that explain pairing/stacking and normalization outcomes.
- **Belongs in:**  
  both
