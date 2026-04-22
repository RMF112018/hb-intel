# 07 — Recommended Implementation Waves

## Wave 01 — Strategy lock and shell/data contract reset
Goal:
- stop treating Safety as a secondary newsroom-adjacent passenger
- lock the target information architecture
- define the application-level fit/breakpoint contract before visual rebuild work starts

Recommended prompts:
1. reclassify Safety shell semantics and default homepage placement
2. define the new Safety homepage information architecture and contract
3. define application-level modes and shell-fit rules

## Wave 02 — Surface rebuild and consumer integration
Goal:
- implement the rebuilt safety surface family
- update the consumer to map the new model
- ensure homepage integration uses the new shell contract and action posture

Recommended prompts:
1. replace or re-found the safety homepage surface family
2. rebuild `SafetyFieldExcellence.tsx` around the new model
3. update zone + preset behavior and remove weak semantic allowances

## Wave 03 — Proof, accessibility, package, and hosted closure
Goal:
- prove the rebuild is real in Storybook and packaged runtime
- validate keyboard/focus/reduced-motion behavior
- validate homepage pairing/stacking decisions across real breakpoint states

Recommended prompts:
1. visual proof + storybook closure
2. accessibility / keyboard / reduced-motion proof
3. build, inspect, package, tenant-aware validation closure

## Acceptance rule
Do not close after Wave 02 just because the rebuilt surface looks better in local preview.
Closure requires:
- proof of shell placement correctness
- proof of compact/minimal mode behavior
- proof of focus/reduced-motion behavior
- proof that the packaged/hosted result still matches the intended upgrade


## Scorecard gates by wave

### After Wave 01
Expected outcome:
- Safety is no longer obviously failing homepage integration / shell posture categories
- the implementation has an explicit contract and breakpoint roadmap sufficient to support the rebuild

### After Wave 02
Expected outcome:
- the dominant UI outcome is no longer generic-card-adjacent
- the rebuilt surface materially improves persona, hierarchy, interaction completeness, and state-model sophistication

### After Wave 03
Required closure outcome:
- final score must target **40+/56 minimum** for homepage-grade acceptance
- no touched-scope category remains below **2** without an explicit written exception
- final closure must explicitly state whether the result is merely homepage-grade or truly benchmark-grade
