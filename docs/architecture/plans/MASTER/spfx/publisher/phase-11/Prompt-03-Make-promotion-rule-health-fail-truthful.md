# Prompt 03 — Make promotion-rule health fail truthful

## Objective
Close the remaining silent-fallback defect in promotion-rule loading so the shell can distinguish:
- **no active promotion rules configured**, from
- **promotion rules failed to load**

This prompt is about operator truthfulness and policy-health observability, not about redesigning promotion-rule selection precedence.

---

## Repo-truth current state

The underlying promotion policy logic is already more mature than the earlier remediation package described:

- `promotionRuleSelector.ts` deterministically resolves policy by scope precedence
- save-time normalization already re-applies locked policies
- the current UI does not expose direct `IsFeatured` / `IsPinned` toggles

However, the workspace load path is still too soft:
- `useDraftWorkspace` loads `repositories.promotionRules.listActive()`
- on failure it catches and silently calls `setPromotionRules([])`
- the rest of the shell then behaves as though there were simply no active rules

That collapses two materially different operational states into one.

---

## Why this is wrong

When configuration absence and repository failure look identical:
- operators cannot trust the promotion summary
- support/debugging becomes harder
- policy behavior can appear arbitrary
- the shell can no longer say whether it is applying true defaults because no rules exist, or because configuration health is degraded

For a publishing surface, policy health needs truthful visibility.

---

## Governing authority / required reference docs

### Required repo references
- `apps/hb-publisher/src/webparts/articlePublisher/workspace/useDraftWorkspace.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/data/publisherAdapter/promotionRuleSelector.ts`
- any promotion-summary or diagnostics component that surfaces policy state

### Research lenses to apply while implementing
Use these concepts:
- explicit finite states rather than implicit fallbacks
- truthful degradation messaging
- separate “empty configuration” from “dependency failure”
- keep user-facing copy concise and operationally actionable

Do **not** change the actual selection precedence (`destination > homepage > global`) unless repo-truth review proves a real correctness defect there.

---

## Files and seams to inspect exhaustively

### Rule load / state ownership
- `apps/hb-publisher/src/webparts/articlePublisher/workspace/useDraftWorkspace.ts`

### Shell and summary surfaces
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- any promotion summary / diagnostics surface rendered in the shell

### Selector behavior
- `apps/hb-publisher/src/data/publisherAdapter/promotionRuleSelector.ts`

### Tests
- any existing tests around workspace loading and promotion summaries
- create new targeted tests if no current file covers the load-failure distinction

---

## Exact defect to close
A failed promotion-rule repository read is silently collapsed into an empty ruleset, making the shell behave as though policy configuration is intentionally absent.

That is not fail-truthful.

---

## Required implementation objective
Introduce explicit promotion-rule health modeling and surface it in the authoring shell.

### The end state must do all of the following
1. **Distinguish promotion-rule states explicitly**
   - loading
   - ready with rules
   - ready but empty
   - failed to load

2. **Keep policy application deterministic**
   - if rules truly are empty, fallback defaults remain deterministic
   - if rules failed to load, the shell must still behave safely, but it must not pretend the configuration is intentionally empty

3. **Surface the difference clearly**
   - the operator must be able to tell whether current promotion behavior reflects:
     - configured policy,
     - genuine no-rules fallback, or
     - degraded policy health

4. **Do not break save-time normalization**
   - locked rules must still be re-applied on save when rules are available
   - do not regress the current supported Project Spotlight behavior

5. **Keep copy operational**
   - messages should help the operator understand whether the system is healthy, not overwhelm them with internal implementation detail

---

## Strong implementation guidance

### Preferred implementation pattern
Add a typed promotion-rule health state at the workspace layer and thread it into the shell.

Do not treat `promotionRules: []` as both:
- the source of truth for “no rules exist,” and
- the recovery value for “rules failed to load.”

Those are not the same state.

### Recommended UI behavior
At minimum, the shell should:
- expose a concise health line or warning in the promotion/readiness area
- avoid silently narrating policy as if it were healthy when the load actually failed
- preserve the existing summary semantics when the state really is healthy

### Scope guard
Do **not** widen this prompt into:
- new promotion editors
- direct featured/pinned toggle UI
- changes to rule precedence or rule schema
unless exhaustive code review proves an actual defect there.

---

## Adjacent systems that must be reconciled
You must reconcile this prompt against:
- save-readiness and preflight health modeling from Prompts 01 and 02
- status-banner wording
- promotion summary copy
- fallback/default policy application
- any comments/docs that still imply silent fallback is acceptable operational truth

---

## Validation and regression requirements
You must prove all of the following:

1. A failed rule load no longer looks identical to a genuine empty ruleset.
2. The operator can see policy-health truth in the shell.
3. A genuine empty ruleset still behaves deterministically.
4. A healthy loaded ruleset still behaves exactly as intended.
5. Locked policy re-application on save is not broken.

### Minimum test expectations
Add or update targeted tests that pin:
- rule-load failure state
- true empty-rules state
- healthy loaded state
- unchanged selector precedence for the supported branch

---

## Required closure artifacts
Create a closure report in the Publisher closure docs that states:
- the explicit promotion-rule health states introduced
- how failure differs from true empty configuration
- which shell surfaces now expose policy health
- which tests were added/updated

The report must document the implemented end state, not future policy management ideas.

---

## Mandatory operating instructions
- Work in the live local `hb-intel` repo.
- Treat repo truth as final authority over earlier package wording.
- Scrub the full promotion-rule load and shell-summary path before changing anything.
- Do not make unrelated changes.
- Do not weaken existing supported Project Spotlight behavior.
- Prove closure before moving to the next prompt.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
