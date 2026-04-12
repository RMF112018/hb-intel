# HB Kudos — Repo-Truth Audit Prompt Package

## Objective

This package instructs a local code agent to remediate the current HB Kudos implementation in the live `main` branch of `RMF112018/hb-intel` based on a repo-truth audit of the real render surfaces and supporting seams.

The goal is not cosmetic cleanup. The goal is full closure of the audited issues until the Kudos public surface and the Kudos companion surface satisfy the standard of a premium, production-grade React / SPFx application.

## Binding authority

The code agent must treat these as binding authority for every prompt in this package:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Additional relevant guidance under `docs/reference/ui-kit` must also be reviewed and followed, but the two doctrine files above take precedence wherever they speak directly.

## Source of truth

- Live repo: `RMF112018/hb-intel`
- Branch: `main`
- Primary render scope: `apps/hb-webparts/src/webparts/`
- Supporting shared seams: `apps/hb-webparts/src/homepage/shared/`, `apps/hb-webparts/src/homepage/data/`, `apps/hb-webparts/src/homepage/helpers/`, `apps/hb-webparts/src/mount.tsx`, and related tests / manifests / packaging files

## Execution model

This package is intentionally serialized.

The local code agent must work **one finding at a time**:

1. isolate the exact finding,
2. map the full repo-truth footprint,
3. scrub all directly and indirectly related code,
4. remediate the issue completely,
5. validate closure,
6. only then proceed to the next prompt.

## Non-negotiable guardrails

- Do not treat multiple unrelated findings as one blended workstream.
- Do not perform superficial patching.
- Do not leave duplicate, stale, contradictory, or fallback behavior behind.
- Do not declare completion because one visible symptom improved.
- Do not preserve weak composition, weak primitives, weak queue models, or weak styling seams simply because they already compile.
- Do not re-read files that are still within your active context window or current working memory. Re-read only when needed to confirm drift, resolve ambiguity, or inspect adjacent seams you have not yet loaded.
- Preserve strong seams that the audit explicitly marked as worth keeping.

## Known strong seams to preserve

- `apps/hb-webparts/src/webparts/hbKudos/kudosRuntimeContract.ts`
- mount-map linkage in `apps/hb-webparts/src/mount.tsx`
- manifest adjacency and packaging structure
- `@hbc/ui-kit/homepage` import posture
- typed governance patch contracts
- doctrine guard tests that still reflect valid invariants

## Package contents

- `README.md` — this file
- `Plan-Summary.md` — sequencing and priorities
- `Audit-Findings-Summary.md` — concise issue register
- `00-Executive-Audit-Report.md` — full audit narrative
- `Prompt-00-*` through `Prompt-10-*` — serialized closure prompts

## Recommended execution order

Follow the prompts in numerical order. Do not skip ahead unless a prior prompt explicitly directs you to do so.
