# 10 — Validation and Closure Prompt

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
## Objective

Conduct the final repo-truth closure audit for the `hbSignatureHero` dynamic-article implementation and verify that the work is complete, coherent, and gap-free.

## Closure standard

Do not declare closure unless all of the following are true:

### Homepage preservation
- HBCentral always resolves to homepage mode
- the flagship homepage hero behavior is unchanged
- no article furniture appears on HBCentral

### Article capability
- non-HBCentral article mode supports:
  - primary image
  - title
  - subheading
  - author name
  - author photo
  - published date
  - published time
  - optional metadata/labels

### Architectural hygiene
- shared lower-level seams are used appropriately
- no direct coupling to Kudos runtime remains
- no stale duplicate contracts remain
- mode ownership is explicit and readable

### Runtime/package integrity
- typecheck passes
- lint passes
- build passes
- any relevant package validation passes
- manifests/runtime mapping are still coherent

### Proof quality
- story/harness proof exists
- visual proof exists
- partial/empty/error states are professional
- accessibility and reduced-motion expectations are preserved

## Required audit posture

Perform a fresh closure scrub of the full affected footprint.
Do not assume earlier prompts were correct.
Confirm the final state in code.

## Required output

Return:

1. **Closure verdict**
   - closed / not closed

2. **Evidence summary**
   - what was verified
   - what files prove it
   - what tests/builds/proof ran

3. **Gap register**
   - any remaining gaps, however small

4. **Follow-on recommendations**
   - only if they are truly optional and not closure blockers

If anything is not fully closed, say so plainly and itemize the exact remaining work.
