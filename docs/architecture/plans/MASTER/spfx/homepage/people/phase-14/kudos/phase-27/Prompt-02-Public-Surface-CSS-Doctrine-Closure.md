# Prompt-02 — Public Surface CSS Doctrine Closure

## Objective

Close the finding that `kudosSurface.module.css` remains materially non-compliant with the homepage doctrine because it still contains ordinary-source raw hex, raw rgba, hardcoded spacing, hardcoded gradients, and local presentation hacks.

This prompt is about **public-surface CSS doctrine closure only**.

## Active finding only

Only remediate this finding:
- public-surface CSS remains materially non-compliant with homepage token discipline

Do not use this prompt to redesign the information architecture or moderation workflow. Structural UI changes are for later prompts unless they are absolutely required to remove doctrine-breaking CSS.

## Repo-truth starting footprint

At minimum inspect:

- `apps/hb-webparts/src/webparts/hbKudos/kudosSurface.module.css`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`
- any related style modules or token seams consumed by the public surface

## Required work

1. Eliminate doctrine-breaking raw literal styling in ordinary homepage source wherever the doctrine does not clearly justify a local flagship exception.
2. Rebuild the file around governed `--hbk-*` variables and disciplined aliases.
3. Normalize spacing, radius, shadows, borders, and hover/focus treatments so the file stops acting like a hand-painted one-off.
4. Keep the surface visually strong, but stop relying on undocumented local materials and decorative hacks.
5. Preserve accessibility and reduced-motion support.
6. Make the resulting CSS obviously more governable and maintainable by inspection.

## Exhaustive scrub requirement

- Remove obsolete classes that existed only to support the old styling approach.
- Remove unused gradients, shadows, and duplicate state rules.
- Remove contradictory comments that claim doctrine compliance where the source was still violating it.
- Verify that no public-surface CSS module still contains the same class of doctrine drift in parallel.

## Not acceptable

- Merely centralizing raw literals without reducing them
- Keeping most raw styling and calling it a “flagship exception”
- Converting a file full of raw literals into a slightly different file full of raw literals
- Fixing only the hero while leaving recent/archive in the same drift posture

## Closure standard

Do not declare this finding closed until you provide:
1. every raw styling source that was removed or justified,
2. the final public-surface files in scope,
3. the remaining exception list, if any,
4. proof that the public CSS now follows the doctrine far more closely than the repo-truth baseline.
