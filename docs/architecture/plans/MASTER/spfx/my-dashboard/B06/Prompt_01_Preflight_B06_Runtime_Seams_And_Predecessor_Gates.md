# Prompt 01 — Preflight B06 Runtime Seams and Predecessor Gates

## Role

Act as a strict repo-truth implementation auditor. Your job is to determine whether the repository is ready for B06 runtime hardening.

## Objective

Confirm whether the B05 runtime integration seams needed by B06 exist in the current working tree. B06 must harden the established runtime path; it must not invent a parallel Adobe integration if the B05 runtime predecessor has not landed.

## Required preflight checks

Inspect repo truth for:

### A. Existing My Dashboard app domain
Confirm:
```text
apps/my-dashboard/
```

### B. Existing My Work backend read-model host
Confirm:
```text
backend/functions/src/hosts/my-work-read-model/
```

### C. Existing B05 runtime Adobe seams
Look for evidence of:
- Adobe OAuth start/callback route support,
- delegated grant store or grant-record abstraction,
- token-refresh service seam,
- Adobe search provider/adapter,
- source-handoff policy or URL-validation seam,
- frontend queue module/data flow that can support manual refresh hardening.

Do not assume these exist; inspect.

## Decision rule

### If the B05 runtime seams exist
Proceed and produce a short “B06 runtime work may continue” report.

### If the B05 runtime seams do not exist
Stop after reporting:
- which B05 runtime seams are missing,
- why B06 runtime hardening would be premature,
- which prompts from the B05 runtime implementation package must precede B06.

Do not:
- invent replacement provider/service architecture,
- duplicate the B05 package,
- implement speculative OAuth/token code in this prompt.

## Repo-context discipline

Do not re-read large files already within the current session context unless drift is suspected. Use targeted file searches and focused reads.

## Closeout format

1. Verdict:
   - `READY FOR B06 RUNTIME`
   - or `BLOCKED — B05 RUNTIME PREDECESSOR NOT PRESENT`
2. Files/seams confirmed.
3. Seams missing, if any.
4. Recommendation on whether to continue to Prompt 02.
