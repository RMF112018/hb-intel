# 02 — Granular Findings

## Finding 01 — Admin save still relies on positional identity

### Current attached-package posture
The attached package identifies this as the primary admin trust issue.

### Repo-truth assessment
Correct, and still critical.

The current save flow builds item payloads using `resolvedItems[i]?.id` paired against `itemDrafts[i]`.
That means persisted identity is still derived from array position rather than from a durable draft identity wrapper.

### Why the current prompt framing is insufficient
The prompt names the bug, but it does not explicitly force:
- a persisted-ID wrapper
- lifecycle-state modeling
- operation derivation for create/update/archive/reorder
- proof that reorder and archive semantics remain truthful after mixed edits

### What is missing
- explicit lifecycle enum or equivalent
- persisted ID carried in draft state
- operation planner
- reorder reconciliation model
- destructive-action handling policy
- focused regression tests

### Recommended package action
Rewrite as Prompt 01.

### Implementation implications
This change will reshape admin draft models, save orchestration, and tests.

### Closure implications
No other admin or preview work should be trusted until this is fixed.

---

## Finding 02 — Reorder seam exists but is not part of the real admin flow

### Current attached-package posture
Implicitly included inside the persistence prompt.

### Repo-truth assessment
Still real.

`reorderPriorityRailItems(...)` exists, but the admin currently reorders only the draft array and later saves through the normal item-save loop.
The dedicated reorder seam is therefore present in architecture but absent in behavior.

### Why the current prompt framing is insufficient
The prompt notes the existence of the seam but does not require the agent to choose and implement one coherent reorder model.

### What is missing
- explicit reorder-intent treatment
- rule for when reorder is persisted
- read-after-write reconciliation rule
- error handling when reorder partially fails

### Recommended package action
Keep inside Prompt 01, but make it explicit and testable.

### Closure implications
A “save works” claim is not credible until reorder correctness is proven separately from simple edit correctness.

---

## Finding 03 — Archive semantics are structurally ambiguous

### Current attached-package posture
Identified, but only briefly.

### Repo-truth assessment
Still real.

Archive currently performs an immediate server-side write inside the broader draft-editing product.
That breaks the mental model of “I am editing a draft and will save or discard.”

### Why the current prompt framing is insufficient
The prompt allows either model but does not define the closure standard strongly enough.

### What is missing
- explicit requirement to choose one model and remove ambiguity
- destructive-action confirmation and status treatment
- dirty-state behavior for archived rows
- post-archive refresh and library-state handling

### Recommended package action
Keep in Prompt 01 and make it non-optional.

---

## Finding 04 — Permission model is orphaned

### Current attached-package posture
The attached package correctly says permission handling is incomplete.

### Repo-truth assessment
Still real and more severe than the current package suggests.

The data layer defines permission types, and the CSS includes a permission banner style, but the admin runtime does not actually resolve or enforce a permission state.

### Why the current prompt framing is insufficient
It treats permission states as a UI refinement instead of a runtime truth requirement.

### What is missing
- a real permission seam
- state derivation for editable/read-only/insufficient-write-access
- control disabling tied to permission reality
- visual treatment for non-authorized states
- proof that write actions cannot appear available when they are not

### Recommended package action
Address in Prompt 05, but depend on Prompt 02 hardening.

### Closure implications
The admin surface cannot be called maintainer-grade while it exposes write affordances without trusted permission gating.

---

## Finding 05 — Validation breadth is declared but not fully implemented

### Current attached-package posture
Not isolated as its own workstream.

### Repo-truth assessment
Still real.

The contracts declare issue kinds such as duplicate-active-config and invalid-icon-key, but the validation engine only enforces a narrow subset.
The current validation logic also does not fully protect config/runtime coherence.

### Why the current prompt framing is insufficient
The original package spreads this concern across admin prompts, which makes it easy to under-deliver.

### What is missing
- dedicated validation hardening
- config bounds checks
- duplicate active-row protection
- icon-key validity or safe registry fallback
- schedule/audience/runtime coherence checks
- test coverage for declared issue kinds

### Recommended package action
Add Prompt 02.

### Closure implications
Without this work, the admin can still produce configurations the runtime only partially honors.

---

## Finding 06 — Shared surface family is still a premiumized list, not a true command band

### Current attached-package posture
Correctly identified.

### Repo-truth assessment
Still real.

The surface family:
- renders a flat visible list
- uses a simple inline overflow disclosure
- exposes only three layout modes
- does not yet make grouped or segmented command structures materially real
- still reads visually like a card/list strip

### Why the current prompt framing is insufficient
It does not distinguish between:
- rebuilding the shared family itself
- aligning public/admin consumers to that rebuilt family

### What is missing
- richer surface API
- more honest variant model
- composition-based breakpoint treatment
- overflow model suitable for desktop/tablet/phone differences
- stronger primary-vs-overflow hierarchy

### Recommended package action
Rewrite as Prompt 03 and add Prompt 04.

---

## Finding 07 — Public runtime and preview do not honor the full authored config model

### Current attached-package posture
Mentioned indirectly, but not given its own prompt.

### Repo-truth assessment
Still real and high-impact.

Examples:
- config supports `segmented`, `hybrid`, and `sheet-trigger`
- public runtime reduces these into a narrower set
- preview exposes only `desktop` / `tablet` / `phone`
- actual runtime device model distinguishes five classes
- current device logic is based on global viewport width, not container-aware layout conditions

### Why the current prompt framing is insufficient
This is not just a preview issue.
It is a consumer-integration issue affecting public truth.

### What is missing
- honest layout-mode mapping
- responsive behavior driven by real component/container conditions
- preview parity with public behavior
- grouped action expression where config supplies group metadata

### Recommended package action
Add Prompt 04.

### Closure implications
Until runtime and preview are aligned, the admin cannot truthfully preview what the public sees.

---

## Finding 08 — Grouping exists in contracts but not in meaningful surface behavior

### Current attached-package posture
Only implied.

### Repo-truth assessment
Still real.

Contracts and item models carry `groupKey` and `groupTitle`, and the ui-kit type layer exposes a group model, but the shared surface props and public rendering are still functionally flat.

### Why the current prompt framing is insufficient
The original package refers to stronger command-band behavior without forcing the model to actually express grouped command structure.

### What is missing
- grouped surface API or grouping preprocessing
- grouped visible action composition
- consistent group treatment in preview and overflow

### Recommended package action
Address across Prompt 03 and Prompt 04.

---

## Finding 09 — Token discipline and visual-system compliance are still weak

### Current attached-package posture
Under-emphasized.

### Repo-truth assessment
Still real.

Both the shared surface CSS and the admin CSS contain hardcoded colors, borders, and backgrounds.
The preview device buttons also include inline styling.
This undermines doctrine compliance and keeps the command band in a “safety-zone premium card” visual posture.

### Why the current prompt framing is insufficient
The original package treats this like polish.
It is not just polish.
It materially affects shared-system quality and prevents honest closure.

### What is missing
- token replacement
- alias cleanup
- stronger visual grammar for command surfaces
- removal of one-off inline styles

### Recommended package action
Add Prompt 06.

---

## Finding 10 — Closure docs overstate completion relative to actual evidence

### Current attached-package posture
Not addressed.

### Repo-truth assessment
Still real.

The repo includes closure checklist and scorecard files that claim code-side closure and 35/40 pass status while still admitting hosted screenshots are pending.
More importantly, current repo truth still exposes unclosed behavioral gaps.

### Why the current prompt framing is insufficient
The wave package does not instruct the code agent to refresh these documents or capture closure evidence honestly.

### What is missing
- hosted validation run
- screenshot evidence
- runtime console verification
- updated scorecard/checklist language that matches post-fix truth

### Recommended package action
Add Prompt 06.

### Closure implications
False closure must be removed before the wave can be called done.

---

## Finding 11 — The original package sequence is too compressed

### Current attached-package posture
Three prompts in order.

### Repo-truth assessment
Insufficient sequencing.

The original sequence forces:
- admin product completion
- while contract hardening is still implicit
- while the shared surface is still incomplete
- while runtime/preview alignment is still unaddressed
- while closure-proof work is absent

### Recommended package action
Resequence to six prompts with explicit dependency order.
