# 04 — Enhanced Findings Register

## Priority model
- **P0** severe hosted shell-fit failure / materially broken host-aware rendering
- **P1** major shell-level weakness / serious compliance gap
- **P2** meaningful improvement / necessary hardening
- **P3** secondary hardening or polish

---

## Finding P0-01 — Outer page-canvas authority is split across the wrapper and shell
**Priority:** P0  
**Files:**
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`

### Issue
Both the entry stack root and the shell root present themselves as full-width, centered, max-width-limited outer envelopes. The shell then layers its own breakpoint-sensitive root padding on top of that.

### Why the attached package treatment was insufficient
The attached package correctly noticed duplicated width authority, but it did not distinguish clearly enough between:
- the single outer page-canvas contract that should govern fit, and
- inner region-specific inset choices that may still differ intentionally.

### Visible or likely symptoms
- right-edge drift or overflow under hosted conditions
- difficulty reasoning about where usable width is actually coming from
- fragile alignment between the top actions strip and the shell body
- future regressions whenever one seam changes padding or max-width independently

### Doctrine relevance
This violates the repo’s “page-canvas ownership” and “width/compositional authority” guidance.

### Why it matters
As long as outer authority is split, the shell can look container-aware while still being wrong about the host-fit contract.

### Recommended correction direction
Create one authoritative outer envelope contract and make wrapper and shell consume it intentionally. Preserve region-specific inner inset differences only inside that shared authority.

### Refinement or structural redesign?
Structural hardening, not wholesale redesign.

### Proof requirements
- a single declared outer envelope contract exists
- wrapper and shell no longer compete as top-level fit authorities
- hosted screenshots/harnesses show stable left and right edges

---

## Finding P0-02 — The runtime width model is still too self-referential
**Priority:** P0  
**Files:**
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`

### Issue
The shell’s entry-state and layout decisions are driven by observed shell-element width rather than by a deliberately declared authoritative usable-width seam.

### Why the attached package treatment was insufficient
The attached package mentioned measurement rebasing, but it did not fully elevate how much downstream behavior depends on this one seam.

### Visible or likely symptoms
- wrong entry-state selection near breakpoints
- unstable pair-vs-stack behavior
- misleading conformance data attributes
- inability to prove whether a layout state is actually host-correct

### Doctrine relevance
The breakpoint spec says practical usable width matters more than nominal hardware width. The homepage overlay says row sharing must be based on actual slot width.

### Why it matters
This seam decides the shell’s runtime posture. If it is based on the wrong width truth, the shell can be consistently wrong while still appearing internally coherent.

### Recommended correction direction
Introduce an explicit authoritative measurement model that computes usable width after the shared outer envelope and intentional shell insets are accounted for.

### Refinement or structural redesign?
Structural hardening of an existing mature seam.

### Proof requirements
- the code agent defines the new authoritative width source explicitly
- breakpoint tests validate threshold behavior
- band-layout tests prove the corrected width is the input

---

## Finding P1-03 — Outer authority and inner inset policy are conceptually conflated
**Priority:** P1  
**Files:**
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- attached prompt package prompts 01–03

### Issue
The current package language leans toward “unify everything,” but the live repo comments explicitly justify a narrower actions strip than the shell below it.

### Why the attached package treatment was insufficient
It risks making the code agent flatten deliberate composition differences instead of fixing the real fit contract.

### Visible or likely symptoms
- prompts that over-correct and erase intentional top-band character
- false closure based on matching gutters rather than matching outer fit authority

### Doctrine relevance
Doctrine encourages confident composition, not timid sameness.

### Why it matters
The remediation must be accurate, not just strict.

### Recommended correction direction
Force the code agent to define:
- the shared outer fit contract, and
- separately, the intentional inner-region inset policy.

### Refinement or structural redesign?
Refinement of remediation framing.

### Proof requirements
- closure report explicitly distinguishes outer contract from inner insets
- actions strip may remain visually narrower without breaking shared fit

---

## Finding P1-04 — The wrapper-owned actions region lacks a hard shared-fit contract with the shell
**Priority:** P1  
**Files:**
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`

### Issue
The wrapper-owned actions region is correctly kept out of shell occupant semantics, but its containment relationship to the shell is still too implicit.

### Why the attached package treatment was insufficient
It asks for unification, but it does not force the code agent to explain exactly how wrapper ownership is preserved while shared fit authority is strengthened.

### Visible or likely symptoms
- slight alignment drift between top strip and shell body
- top-band rendering that remains visually plausible but not rigorously governed

### Doctrine relevance
Homepage webparts own the page canvas, and top-band patterns are load-bearing surfaces in doctrine.

### Why it matters
This is the seam where wrapper ownership and shell-fit discipline meet. It needs a precise contract, not just CSS adjustment.

### Recommended correction direction
Bind the actions region to the same outer fit contract while preserving wrapper ownership and keeping the rail outside shell semantics.

### Refinement or structural redesign?
Structural hardening at the boundary.

### Proof requirements
- wrapper ownership remains explicit
- rail remains non-shell
- actions strip and shell align as one governed page-canvas composition

---

## Finding P1-05 — Closure diagnostics are not rich enough for width-truth debugging
**Priority:** P1  
**Files:**
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellConformance.ts`

### Issue
The shell already emits useful data attributes, but it does not yet expose enough inspectable width truth to make host-fit debugging and proof straightforward.

### Why the attached package treatment was insufficient
It asks for proof without requiring the observability needed to make that proof durable.

### Visible or likely symptoms
- harder black-box diagnosis when a threshold misfires
- difficulty separating entry-state defects from fit-contract defects

### Doctrine relevance
Runtime resilience and authoring safety both improve when shell state is inspectable.

### Why it matters
If the shell cannot explain its width decisions, regressions will be hard to triage.

### Recommended correction direction
Add stable diagnostics for outer envelope width, usable width, entry-state reason, and relevant inset/constraint state.

### Refinement or structural redesign?
Refinement and hardening.

### Proof requirements
- tests assert stable diagnostic outputs
- closure report uses those diagnostics directly

---

## Finding P1-06 — Current proof is too narrow to close a screenshot-class defect
**Priority:** P1  
**Files:**
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepageEntryStack.test.tsx`
- any current homepage shell validation/harness seams used by the agent during implementation

### Issue
Current proof covers wrapper composition order and boundary integrity but not hosted-fit closure.

### Why the attached package treatment was insufficient
It correctly asks for more proof, but it does not force a concrete matrix strong enough to reject a superficial fix.

### Visible or likely symptoms
- changes can look clean in a narrow test path and still fail under hosted breakpoints
- closure can be claimed too early

### Doctrine relevance
The breakpoint spec and homepage overlay both demand real behavior across practical device classes and constrained conditions.

### Why it matters
This exact weakness allowed the current defect class to remain plausible.

### Recommended correction direction
Add focused proof for:
- authoritative width accounting
- entry-state truth around thresholds
- no-hosted-overflow regression
- desktop/tablet/mobile hosted validation
- short-height branch where supported

### Refinement or structural redesign?
Proof hardening.

### Proof requirements
- automated tests added or extended
- hosted screenshots or harness captures included
- closure report explicitly states that the original defect class is no longer reproducible

---

## Finding P2-07 — The attached package does not require a strong enough closure report
**Priority:** P2  
**Files:**
- attached implementation prompt package

### Issue
The existing prompts request proof, but not in a way that forces a structured final report describing exactly what changed and how closure was proven.

### Why the attached package treatment was insufficient
It leaves too much room for an implementation summary that sounds complete without being complete.

### Visible or likely symptoms
- vague completion notes
- hidden residual risk
- weak handoff quality

### Recommended correction direction
Require a final closure report that covers:
- outer authority
- measurement model
- actions-region boundary
- diagnostics changes
- tests added
- hosted validation cases
- residual risks

### Refinement or structural redesign?
Refinement.

### Proof requirements
- final report uses a required template
- missing sections fail closure
