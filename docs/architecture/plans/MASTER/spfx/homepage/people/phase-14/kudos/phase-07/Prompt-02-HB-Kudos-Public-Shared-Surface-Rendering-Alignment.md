# Prompt-02 — HB Kudos Public Shared Surface Rendering Alignment

```md
Objective

Tighten the rendering alignment between the public HB Kudos implementation and any shared people/culture surface family logic that participates in the featured public spotlight.

Primary problem

The remaining defect may not live entirely in the public webpart.  
It may live in the assumptions or rendering path of the shared surface family itself.

This prompt is for validating and correcting that alignment carefully.

Critical Constraints

- Use live repo truth.
- Do not begin by re-reading files already in active context or memory.
- Maintain strict focus on the public Kudos rendering path and its directly supporting shared surfaces.
- Maintain strict compliance with `@hbc/ui-kit` governance and homepage doctrine.
- Do not promote or rewrite shared surface logic without a clear justification.
- Do not leave fragile implicit assumptions in place simply because they currently compile.

Primary tasks

1. Audit the shared people/culture surface path that renders the public featured recognition state.
2. Identify any mismatch between:
   - what the public Kudos adapter supplies
   - what the shared surface expects
   - what the shared surface actually does when content is sparse or optional
3. Implement the appropriate alignment changes so the public featured state renders predictably and credibly.
4. Preserve or improve governance by making the smallest justified shared/ui-kit change necessary.
5. Ensure the resulting rendering path is easier to reason about, not more magical.

Required outcome

After this prompt:
- the shared rendering path should be aligned with the public Kudos contract
- the public featured state should not collapse due to silent shared-surface assumptions
- the final boundary should be explainable and governed

Required deliverables

- implementation changes
- concise explanation of the shared-surface alignment issue that was found
- explicit note of any shared or ui-kit surface changes and why they were justified
- rendered evidence that the public featured state now survives the corrected shared path

Acceptance standard

This prompt is successful only if the public Kudos featured rendering path becomes materially more stable and governed at the shared-surface level.
```
