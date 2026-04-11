# HB Kudos Repo-Truth Audit Summary

## Executive conclusion
The live repo confirms that the implementation is still structurally biased toward preserving the current shared path rather than closing the user-visible failures.

The two most important failures are real and code-backed:

1. **People picker failure**
   - `HbKudos.tsx` opens the composer in typed mode and passes `searchPeople` into `HbcKudosComposerForm`.
   - The UI kit form does support a search-select token picker when `searchPeople` works.
   - The actual resolver in `useSharePointPeopleSearch.ts` is a custom `fetch()` wrapper around `ClientPeoplePickerSearchUser`.
   - That wrapper swallows every error and returns an empty array for all failure paths.
   - Result: the surface presents itself like a true people picker, but operationally it degrades into a dead search field that produces “No people found” with no diagnostics.

2. **Featured spotlight hollow/washed-out failure**
   - The homepage variant in `people-culture-surface.module.css` intentionally styles featured-card text as white / near-white.
   - The same variant styles the featured card as a light translucent frosted-glass panel: `background: rgba(255,255,255,0.22)`.
   - That is a poor contrast pairing in the real SharePoint render and is a direct reason the card reads as under-populated or hollow even when content exists.
   - This is not just a content problem. It is a contrast and surface-treatment problem.

## Specific code-backed blockers
- `HbKudos.tsx` still contains a long “boundary decision” comment block explicitly affirming that the shared/ui-kit/local boundary is fit for purpose and that no surface path should be split or relocated.
- `useKudosComposer(..., { recipientsMode: 'typed' })` is present, but successful behavior depends entirely on the search adapter.
- `HbcKudosComposerForm` does have chips, removal, keyboard selection, and combobox semantics. The picker shell is not the main blocker.
- The actual blocker is identity resolution reliability and the lack of proof/telemetry around it.
- `useSharePointPeopleSearch.ts` uses bare `fetch()` instead of SPFx-aware request plumbing and adds no instrumentation, no surfaced error state, no host-aware fallback, and no broader search mode.
- `spContext.ts` hardcodes the canonical list host URL to HBCentral and supports an override, which means people resolution is also being implicitly forced through one site context.

## Why prior prompt rounds failed
- They allowed the agent to keep the current boundary as a default assumption.
- They treated “typed mode exists in code” as equivalent to “real people picker works in-host.”
- They accepted UI kit cleanliness and packaging progress as substitutes for product closure.
- They did not force proof of identity resolution with actual returned principals.
- They did not force a contrast-correct featured card outcome in the real SharePoint host.

## What must change now
1. The code agent must be explicitly authorized to replace or locally fork the current shared surface if that is what closure requires.
2. The people search pipeline must be rebuilt around a proven SPFx-compatible resolver, with visible diagnostics and a validated fallback path.
3. The featured card visual treatment must be corrected for real contrast in the homepage host, not just storybook or theory.
4. Closure cannot be claimed without proof artifacts from the live render and real successful person resolution.
