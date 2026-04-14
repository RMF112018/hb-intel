# Closure 07 — Drift policy, preview, and UI messaging reconciled

## Objective
Make the republish policy, preview drift reporting, validation
guidance, and authoring-UI copy all tell the same story about what
happens when shell or template drift is detected. Replace the
previous layered caveats with one clear truth.

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/republishPolicy.test.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.test.ts`

## Exact issue closed
The authoring UI promised "⚠ drift — will regenerate" for every
drift flag on the preview outcome, but the actual republish policy
only regenerates when `PageTemplateKey` has drifted. Shell-version
drift and render/template-version drift are handled as in-place
updates that preserve the same `PageId` / `PageUrl`. The operator
messaging therefore overstated what publishing would do, and a
parenthetical on the soft-drift preview banner ("or regenerate if
the template forces it") implied tenant template flags could
override in-place updates — but tenant templates no longer expose
`AllowRepublishInPlace` or `ForceRegenerationOnShellChange`, so
those flags do not exist. The validation engine carried the same
stale parenthetical in its action hint. Three republish-policy
tests also encoded the removed behavior and were treating
shell-version drift and template-version drift as regeneration
triggers, keeping the suite red against canonical policy.

## Remediation — one canonical truth
- **PageTemplateKey drift ⇒ regenerate** (new destination page, new
  `PageId`, new `PageUrl`; prior binding superseded).
- **Shell-version drift, render/template-version drift ⇒
  in-place update** (same `PageId` / `PageUrl`, binding merged).
- No template-flag escape hatch exists.

### Specific changes
1. **Authoring UI (`ArticlePublisher.tsx`).**
   - The footer drift chip now branches on
     `preview.drift.templateKeyDrift`: `"⚠ drift — will regenerate"`
     only when a PageTemplateKey change is detected; otherwise
     `"⚠ drift — will update in place"`. The tooltip on each chip
     spells out the consequence in operator terms.
   - The preview panel's drift banner now says the hard-drift case
     results in a new `PageId` / `PageUrl`, and the soft-drift
     case explicitly says the existing `PageId` / `PageUrl` are
     preserved. The stale parenthetical "(or regenerate if the
     template forces it)" is gone.
2. **Validation engine (`validationEngine.ts` → `validateBindingDrift`).**
   - The warning message now states publishing will "update the
     existing page in place (same PageId + PageUrl)" on shell
     version drift.
   - The action hint names the one canonical regeneration trigger —
     PageTemplateKey drift — and explicitly says shell and render
     version drift always update in place.

## Tests added or updated
- `republishPolicy.test.ts`: rewrote the three drift-related test
  cases to match the canonical policy and consolidated the
  redundant shell-version case:
  - "updates in place on shell-identity drift because the binding
    cannot detect PageShellKey drift" — replaces the old "forces
    regenerate on shell key drift regardless of template flags".
  - "updates in place on shell version drift (no template-flag
    escape hatch)" — replaces the old "regenerates on shell version
    drift when template demands regeneration" and subsumes the old
    "in-place updates on shell version drift when template allows
    it".
  - "updates in place on template/render version drift" — replaces
    the old "regenerates on template version drift when
    republish-in-place is disallowed".
  - "forces regenerate on template key drift" retained with an
    additional `regenerationCause` assertion so the canonical
    hard-drift path stays pinned.
- `validation/validationEngine.test.ts`: the existing shell-drift
  warning test now also asserts the warning message mentions
  in-place update and does NOT mention "regenerate", and asserts
  the action hint names `PageTemplateKey` and no longer contains
  the stale "(or regenerate if the template forces it)"
  parenthetical.

Baseline before this prompt: 19 failed, 157 passed.
After this prompt: 16 failed, 159 passed. Three drift tests moved
from red to green; the remaining 16 failures are unrelated
pre-existing issues (test-fixture setup in
`preview/previewBuilder.test.ts` and
`__tests__/publisherEndToEnd.test.ts`, and legacy-field
`pageCompositor.test.ts` cases that reference
`BannerTitleOverride` / `GeneratedPageName` / `ShowGallery` on
article rows — all pre-tenant concerns, outside this prompt's
scope).

## Proof of behavioral closure
- `republishPolicy` is unchanged at the decision-function level; the
  tests now encode exactly the behavior the function performs.
- The validation engine's warning and action hint match the policy
  function verbatim: in-place for shell/version drift, regenerate
  only for PageTemplateKey drift.
- The preview panel and the footer drift chip now key off
  `preview.drift.templateKeyDrift` to choose between regenerate
  messaging and in-place messaging. Soft-drift copy no longer
  hedges about phantom template flags.
- A reviewer reading `republishPolicy.ts`, `validationEngine.ts`,
  and `ArticlePublisher.tsx` in sequence sees the same drift story
  spelled the same way each time.

## Remaining follow-up risks
- The binding schema still has no column to detect `PageShellKey`
  drift (only `PageShellVersion`). If a future operating-model
  change introduces shell-identity tracking at the binding level,
  the policy + messaging will need to extend the hard-drift set to
  include `PageShellKey` changes — the tests pin today's truth and
  will fail loudly if that happens.
- 16 pre-existing test failures remain (pre-tenant-field
  compositor cases and previewBuilder/end-to-end fixture setup).
  They are unrelated to drift semantics but will be addressed by
  later prompts in this phase.
