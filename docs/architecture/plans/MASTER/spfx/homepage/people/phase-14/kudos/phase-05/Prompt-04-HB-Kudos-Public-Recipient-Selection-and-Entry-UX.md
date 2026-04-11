# Prompt-04 — HB Kudos Public Recipient Selection and Entry UX

```md
Objective

Conduct a focused UI-only implementation pass on the **recipient-selection and recipient-entry UX** within the public HB Kudos composer.

Primary Intent

The public-facing recognition experience should make recipient selection feel resolved, typed, trustworthy, and polished. The user should not feel like they are typing raw unresolved strings into generic fields and hoping moderation will sort it out later.

Critical Constraints

- Use live repo truth.
- Do not begin by re-reading files already in active context or memory.
- Maintain strict `@hbc/ui-kit` and homepage doctrine compliance.
- Update, move, or create shared UI where warranted.
- Respect the underlying typed-recipient model.
- Keep this prompt centered on the user-facing recipient UX, not broader workflow redesign.

Focus

Improve the UI/UX for:
- individual recipient entry
- team/department/project-group selection experience
- entered-value presentation
- chip/token/selection visibility where appropriate
- suggestion/search affordance quality where appropriate
- clarity across mixed recipient buckets
- reduction of raw-form feel

Target Outcomes

The rendered experience should move toward these outcomes:
- recipient selection feels premium and deliberate
- the user can clearly understand what they have selected
- the experience better reflects the typed-recipient model in the actual UI
- bucket differences are clear without becoming visually heavy
- the overall recipient section becomes easier to use and less admin-like

Implementation Freedom

Choose the best approach.

Potential directions may include:
- improved chip/token presentation
- stronger suggestion or lookup behavior
- better empty/selected state presentation
- lighter and clearer bucket hierarchy
- different disclosure patterns across recipient types

Do not treat any one mechanism above as mandatory if a better solution emerges.

Do Not

- leave the current raw-feeling recipient entry model mostly intact
- overcomplicate the UI with needless control complexity
- make the recipient section heavier or longer than it already is

Deliverables

1. Implement the recipient UX upgrade.
2. Update or promote shared UI if warranted.
3. Provide a concise summary of what changed.
4. State which remediation-matrix rows were advanced or closed.
5. Note any dependency or limitation that should be addressed later.

Acceptance Standard

This prompt is successful only if recipient entry/selection now feels materially more premium, typed, and trustworthy in the actual user-facing experience.
```
