# Prompt 02 — CLI, Config, and Documentation Realignment

## Objective
Realign the suite’s CLI, config surface, examples, and operations guidance so that the documented and discoverable normal live-run path is **device-login-first**.

## Repo
- `https://github.com/RMF112018/hb-intel`
- Branch: `main`

## Required posture
- Work from repo truth and the implementation completed in Prompt 01.
- Do not re-read files that are still within your active context window or already inspected during the current step unless needed for accuracy.
- Remove misleading bearer-token-first guidance.

## Required CLI changes
Update runner UX for both:
- `scripts/testing/people-kudos/runAll.ts`
- `scripts/testing/people-kudos/runSuite.ts`

### Required CLI behavior
- `--live` with no token should use device login / cached device-login auth
- help text / usage text must show device-login-first examples
- token injection must be documented only as fallback or advanced override

### Recommended CLI shape
Use something like:
- `--live`
- `--auth-mode deviceCode`
- `--auth-mode token`
- `--token <value>` only when auth mode is token
- optional cache/account management flags only if genuinely useful and not overengineered

If a better CLI shape is more appropriate, implement it — but the default path must remain device-login-first.

## Required config changes
Update the suite config model and example config so it can express the new auth model explicitly.

At minimum update:
- `scripts/testing/people-kudos/config.example.json`
- any config loader / validator types

Document required values clearly, including what a tester must provision in Entra ID for device code flow.

## Required documentation changes
At minimum update:
- operations guide for the suite
- closure report or closure addendum if current closure language is now materially misleading
- any inline usage comments in runner/auth files

### Documentation requirements
The docs must clearly distinguish:
- dry-run
- live run with device login
- fallback token mode, if retained

The docs must no longer present this as the primary live-run example:

```bash
npx tsx scripts/testing/people-kudos/runAll.ts --live --token <bearer-token>
```

If token mode remains, it must appear only as fallback / special-case guidance.

## Required deliverable
Write a documentation-alignment report to:
- `docs/architecture/reviews/people-kudos-device-login-doc-alignment-report.md`

The report must list:
- updated commands
- updated config model
- docs corrected
- any legacy instructions removed or demoted

## Acceptance criteria
A human tester reading the docs should naturally conclude that:
1. dry-run needs no auth
2. live-run normally uses device login
3. manual bearer token injection is not the normal workflow

