# Prompt 05 — Implement My Dashboard Evidence Sanitation and Hosted-Test Guards

## Role

Act as a test/evidence-harness engineer. Extend or prepare the My Dashboard evidence posture so hosted/runtime validation remains useful without capturing sensitive Adobe queue data.

## Objective

Translate B06 evidence rules into code/tests/docs appropriate to current repo truth.

## Required posture

My Dashboard evidence must inherit the PCC live-evidence sanitation doctrine and add queue-specific restrictions.

### Must sanitize or exclude
- emails,
- credential-like terms,
- token-like blobs,
- sensitive query strings,
- raw auth/session/storage-state artifact paths,
- trace/HAR/video-like curated artifacts,
- agreement titles,
- sender names/emails,
- source URLs,
- raw queue JSON,
- raw Adobe bodies,
- OAuth callback query strings.

## Implementation approach

### If a My Dashboard hosted evidence lane already exists
Refine it directly.

### If no My Dashboard hosted evidence lane exists yet
Do not invent a massive unrelated harness. Instead:
- add narrowly scoped shared sanitation utilities or documented evidence contract as appropriate,
- add tests/specs that can later be imported into the My Dashboard live harness,
- ensure B07 or later evidence work has a correct sanitized foundation.

## Acceptable evidence proof
- selector/state matrices,
- card/module presence,
- fixture-based source-state scenarios,
- sanitized warnings,
- safe counts in controlled fixture mode,
- no auth/session artifacts.

## Unacceptable evidence proof
- live queue row text dumps,
- screenshots of real agreement rows by default,
- raw network payload curation,
- callback URLs with query strings,
- auth storage state or cookies.

## Testing requirements

Prove:
1. unsafe text is redacted,
2. unsafe artifact paths are filtered,
3. queue-specific sensitive strings are suppressed/redacted,
4. curated evidence cannot accidentally include auth/session artifacts,
5. evidence helper output remains deterministic enough for validation.

## Scope limits

Do not:
- commit raw screenshots, traces, videos, or HARs,
- alter PCC evidence behavior unless a reusable sanitizer extraction is deliberate and regression-tested,
- build webhook/runtime cache functionality.

## Closeout

Report:
- whether a My Dashboard evidence lane existed,
- what was added or refined,
- sanitizer coverage,
- tests run/results,
- any deliberate deferrals for B07 hosted-evidence work.
