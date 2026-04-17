# Dependency Map

## Critical path

1. **Schema and contract hardening**
   - descriptors
   - raw row types
   - normalized contracts
   - validation contracts
   - canonical list truth

2. **Read seams and normalization**
   - config reader
   - item reader
   - active config resolution
   - audience/schedule/device filtering
   - breakpoint and overflow resolution

3. **Shared rail surface family**
   - shared public surface
   - preview surface
   - loading/empty/error variants
   - icon/badge/overflow primitives
   - breakpoint-aware variants

4. **Public webpart refactor**
   - read path hookup
   - shared surface usage
   - runtime states
   - sticky/overflow/accessibility behavior

5. **Admin writer and draft-state stack**
   - config/item save commands
   - reorder/archive flows
   - validation orchestration
   - permission gating
   - read-after-write refresh

6. **Admin webpart**
   - settings region
   - library/editor region
   - reorder region
   - validation region
   - preview region

7. **Mount / manifest / packaging**
   - mount dispatch
   - manifest adjacency
   - proof-case updates
   - package build validation

8. **Hosted validation and closure**
   - screenshots
   - keyboard/focus checks
   - reduced-motion checks
   - benchmark scoring
   - checklist closure

## Parallelizable after prerequisites

### Can start after Prompt 01 closes
- Prompt 02 and early groundwork for Prompt 03

### Can start after Prompt 02 closes
- Prompt 03 and Prompt 05 in parallel, if contract ownership is stable

### Can start after Prompt 03 and Prompt 05 close
- Prompt 04 and Prompt 06

### Must wait until public + admin are stable
- Prompt 07
- Prompt 08

## Merge rules
- Do not merge read seams into UI prompts.
- Do not merge admin write logic into the public rail prompt.
- Do not merge hosted validation into feature-build prompts.
- Keep the shared surface family separate from the public rail so preview fidelity stays governed.
