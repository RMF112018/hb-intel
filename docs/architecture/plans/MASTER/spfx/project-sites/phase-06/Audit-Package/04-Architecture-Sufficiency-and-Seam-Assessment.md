# 04 — Architecture Sufficiency and Seam Assessment

## Overall judgment

The current architecture is **sufficient for a partial bridge** but **insufficient for durable merged-source closure**.

That means the repo should **not** be rewritten from scratch.

It also means the current lane cannot honestly be called done.

---

## What is already strong enough

### 1. Package ownership
The active consumer lane is concentrated under `packages/spfx/src/webparts/projectSites/**`.

That is the right place to finish this work.

### 2. Mount/runtime posture
The mount boundary and SPFx hosting posture are not the current defect.

### 3. Launch-state logic
`projectSiteLaunchState.ts` already supports truthful legacy launch behavior and should stay downstream of the merged contract.

### 4. Card layer
`ProjectSiteCard.tsx` is already flexible enough to render primary-site and legacy-fallback launches without requiring a UI teardown.

### 5. Client-side pipeline placement
`projectSitesFilter.ts` is the correct layer for source-aware search / filter / sort once source identity becomes explicit.

---

## What is missing or underdeveloped

### A. Explicit merged resolver
This is the largest missing seam.

It should own:
- source matching
- precedence
- duplicate suppression
- synthetic emission
- stable merged identity

### B. Stable merged record identity
The architecture currently lacks a durable record key model suitable for multi-source rows.

### C. Fallback-inclusive browse authority
Year/scope authority still treats `Projects` as the only browseable inventory root.

### D. Stronger consumer adapter boundary
The consumer reads a narrow registry subset without a clearly named adapter seam.

### E. Separation of user truthfulness from comment cleanup
The current earlier package treated docs/comments/copy too monolithically.
The replacement package explicitly separates:
- user-facing truthfulness work
from
- maintainer-comment/doc cleanup

---

## What should *not* be changed unnecessarily

### Do not rebuild the UI shell
The root surface can stay intact.

### Do not move the mount seam
No evidence supports relocating runtime ownership.

### Do not add new runtime dependencies casually
The existing stack is sufficient:
- PnPjs
- React Query
- React
- Vitest/testing-library

A new runtime dependency is not required for closure.

### Do not turn the card into a diagnostics dashboard
The user surface should stay disciplined and operational.

---

## Architecture target state

The correct target state is:

1. **Repository / adapter layer**
   - reads source rows from `Projects` and the fallback registry
   - uses explicit consumer-side source adapters

2. **Resolver layer**
   - merges the two source sets
   - prefers approved linkage where available
   - emits authoritative merged record inputs
   - creates synthetic legacy-only entries when appropriate

3. **Normalized contract**
   - exposes stable merged identity
   - exposes source classification
   - exposes resolved launch target cleanly
   - keeps provenance disciplined

4. **Hook/UI layer**
   - consumes merged records
   - does not re-derive source meaning ad hoc
   - presents truthful state, empty, and action messaging

5. **Tests**
   - prove the merged-source bridge in the cases that matter

---

## Sufficiency decision by seam

### Resolver seam
Current state: insufficient  
Act now: yes

### Stable identity seam
Current state: insufficient  
Act now: yes

### Browse authority seam
Current state: insufficient  
Act now: yes

### Filter/search seam
Current state: underdeveloped  
Act now: yes

### Card/UI seam
Current state: broadly sufficient  
Act now: only contract-driven updates

### Runtime/mount seam
Current state: sufficient  
Act now: no

### Optional provenance diagnostics
Current state: optional improvement  
Act now: only after required work
