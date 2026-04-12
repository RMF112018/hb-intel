# Authority-Lock Note — Phase-27 HB Kudos Remediation Series

This note satisfies the closure requirement of `Prompt-00-Authority-Lock-and-Execution-Protocol.md`. It governs every subsequent prompt (01–10) in this series until explicitly superseded.

## 1. Active remediation topic

- The **only** active remediation topic for this pass is **Prompt-00 — Authority Lock and Execution Protocol**.
- Prompts 01 through 10 are deferred; each will be activated and closed one at a time in sequence.
- No implementation work against any other finding may begin until its prompt is activated.

## 2. Binding authority

The following doctrine files are binding for every prompt in this series:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Additional guidance under `docs/reference/ui-kit/**` will be consulted selectively when it is relevant to the touched seam. Legacy UI doctrine outside those two files is non-authoritative when it conflicts with them or with verified live repo state.

## 3. Source of truth

- The repo source of truth is the live `main` branch at the time each prompt is activated.
- Scoped plans, audit reports, and historical phase artifacts are **execution guidance**, not present-truth. Where they disagree with live `main`, live `main` wins.

## 4. Preserved strong seams

Unless a specific prompt explicitly authorizes breaking one of these, every remediation pass in this series must preserve:

- `apps/hb-webparts/src/webparts/hbKudos/kudosRuntimeContract.ts` — split-runtime contract surface.
- `apps/hb-webparts/src/mount.tsx` runtime-constant linkage — public/companion mount wiring.
- Manifest adjacency and packaging structure for `hbKudos`.
- `@hbc/ui-kit/homepage` import posture — no back-channel imports from feature code into kit internals.
- Typed governance patch contracts (moderation/governance action types).
- Existing doctrine guards (tests, lint rules, import boundaries) that remain valid under the current architecture.

## 5. Files initially in scope for the active finding

Prompt-00 is a governance gate. **No source files are in scope.** The only artifact produced by Prompt-00 is this authority-lock note itself:

- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/phase-27/Authority-Lock-Note.md` (this file)

All code, test, manifest, and doctrine edits are deferred until their owning prompt (01–10) is activated.

## 6. Execution rules acknowledged

- One audited finding at a time; the active prompt defines the only active topic.
- No blending of unrelated findings into a single implementation pass.
- Do not re-read files already in active context unless drift, ambiguity, or an adjacent unseen seam requires it.
- Do not preserve weak code merely because it compiles.
- Do not declare victory on visual improvement alone; each closure must satisfy the closure standard in `Plan-Summary.md`.
- Do not leave stale or contradictory logic behind when a replacement lands.

## Closure

Prompt-00 is closed upon acceptance of this note. The series is now cleared to activate Prompt-01 when the operator chooses.
