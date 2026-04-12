# Prompt-00 — Authority Lock and Execution Protocol

## Objective

Before changing any HB Kudos source, lock the authority stack, execution rules, closure posture, and preservation list for this remediation series.

## Binding authority

Treat the following as binding for all work in this series:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Also review any additional guidance under `docs/reference/ui-kit` that is relevant to the touched seam.

## Execution rules

- You are to address **one audited finding at a time**.
- The finding named in the active prompt is the **only active remediation topic**.
- Do not blend multiple unrelated issues into one implementation pass.
- Do not re-read files that are still within your active context window or current working memory. Re-read only when needed to confirm drift, resolve ambiguity, or inspect adjacent seams you have not yet loaded.
- Do not preserve weak code because it already compiles.
- Do not declare victory because one screenshot looks better.
- Do not leave stale or contradictory logic behind.

## Required pre-work

Produce a short authority-lock note in markdown that confirms:

1. the active prompt is the only active remediation topic,
2. the two doctrine files above are binding authority,
3. the repo source of truth is the live `main` branch,
4. the strong seams that must be preserved during remediation,
5. the exact files you believe are initially in scope for the active finding.

## Preservation list

Unless the active prompt explicitly says otherwise, preserve:

- `apps/hb-webparts/src/webparts/hbKudos/kudosRuntimeContract.ts`
- `apps/hb-webparts/src/mount.tsx` runtime-constant linkage
- manifest adjacency and packaging structure
- `@hbc/ui-kit/homepage` import posture
- typed governance patch contracts
- existing doctrine guards that remain valid

## Closure requirement

Do not start implementation until the authority-lock note is complete and reflects the active prompt accurately.
