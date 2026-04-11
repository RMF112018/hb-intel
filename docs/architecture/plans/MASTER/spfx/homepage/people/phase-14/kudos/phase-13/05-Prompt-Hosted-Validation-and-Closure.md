# 05 — Prompt: Hosted Validation and Closure

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Validate the remediated **public-facing HB Kudos webpart** in real SharePoint-hosted runtime and prove closure.

## Mandatory validation baseline

- SharePoint-hosted runtime
- standard **100% browser zoom**
- optional comparison screenshot at 90% zoom is allowed, but it is not closure proof

## Required proof points

You must prove all of the following:

1. The public-facing module remains premium and branded.
2. The hero + featured recognition composition is visibly more balanced.
3. Duplicate CTA hierarchy is removed or clearly rationalized.
4. The featured recognition shell no longer feels oversized for its payload.
5. The archive/search zone feels intentional and usable.
6. Recipient avatar uses the actual recipient photo when available.
7. Initials appear only as fallback when no photo can be resolved.
8. The surface feels correct at 100% zoom.
9. No regression has been introduced to the public display quality.

## Required artifacts

Capture and provide:

- screenshot of the public webpart at 100% zoom
- optional comparison screenshot at 90% zoom
- screenshot clearly showing recipient photo in the featured recognition avatar
- screenshot of archive/search zone after refinement
- concise validation summary
- files changed
- any remaining issues, explicitly labeled

## Closure rule

Do not claim closure if any of the following remain true:

- the module still feels materially top-heavy at 100%
- both `Give Kudos` CTAs still remain without clear design justification
- recipient avatar still renders initials even though a resolvable recipient photo exists
- archive/search still reads like a compressed afterthought
- validation was not performed in hosted runtime

## Final output format

Return:
- completion status
- proof-point checklist
- screenshot inventory
- ownership summary
- remaining risks, if any
