# 00 — Audit Summary

## Objective

Audit the attached legacy-fallback audit and prompt packages against the live `main` branch of `RMF112018/hb-intel`, then determine what the `project-sites` consumer lane actually needs for a closure-ready merged-source implementation.

## Executive conclusion

The attached packages are **broadly correct in architectural direction** but **not sufficient as a code-agent execution package**.

They correctly identify that the current implementation is still **Projects-first enrichment**, not a full merged-source access layer.

They are materially insufficient because they under-specify:

- merged-record identity and key namespace
- approved-linkage join authority
- user-facing truthfulness gaps in empty/error/context copy
- exact proof-of-closure expectations
- closure-safe issue boundaries for local code-agent execution

## Repo-truth status

The live `main` branch already contains a partial fallback bridge:

- the repository reads the `Legacy Project Fallback Registry`
- raw project rows are decorated with fallback URL fields
- normalization derives `primary-site` vs `legacy-fallback` launch target kinds
- launch-state logic already supports truthful legacy launches
- the card UI already renders `Open Legacy Project Files`

That means the repo is **past concept stage**.

However, it is still **not closure-ready** for the real product objective because:

1. fallback-only records still never surface
2. the merge is still embedded as repository enrichment, not a durable resolver seam
3. browse authority still starts from the `Projects` list
4. merged-record identity is not modeled strongly enough for synthetic records
5. source-aware user reasoning and truthful empty-state behavior are incomplete
6. the tests do not prove the bridge in the cases that matter most

## Most important live proofs

### Proof 1 — no fallback-only record emission
`fetchProjectSites(scope)` still fetches `Projects` first and returns immediately if `projectItems.length === 0`.

That means the consumer cannot surface a valid fallback-only year or a valid fallback-only project inventory.

### Proof 2 — current “merge” is still row decoration
`buildLegacyFallbackLookup(...)` + `applyFallbackLookup(...)` decorate existing project rows.

They do not produce:
- project-only records
- merged records
- synthetic legacy-only records

as explicit first-class record kinds.

### Proof 3 — browse authority is still Projects-derived
`fetchDistinctYears()` reads only the `Projects` list.

`ProjectSitesRoot` gates initial rendering and empty states based on that year authority.

So fallback-only inventory can still be hidden *before* the user ever reaches merged-source evaluation.

### Proof 4 — current normalized identity is too weak for merged-source operation
`IProjectSiteEntry` exposes a single numeric `id` and overloads `siteUrl` as the resolved launch target.

That is adequate for a single-source project browser, but under-modeled for:
- synthetic legacy-only rows
- stable cross-source keys
- resolver provenance
- launch-target explanation

## Newly identified or materially underexplained issues

These are the most important gaps the earlier package did not develop enough:

### A. Merged record identity / React key namespace
The UI currently keys rows by `entry.id`. A future synthetic legacy-only entry cannot safely reuse the project-list numeric id model.

The implementation needs a stable merged record key seam, not just a numeric id field.

### B. Approved-linkage join authority is stronger than the current consumer uses
The registry descriptor already contains:
- `MatchedProjectListItemId`
- `MatchedProjectTitle`
- `MatchConfidence`
- `MatchMethod`

The current consumer-side lookup still joins only by `projectNumber::legacyYear`.

That makes the consumer weaker than the governed registry and risks missing already-approved bindings.

### C. User-facing truthfulness gaps are not only comment drift
The current root surface still tells users that zero-entry scopes and failures came “from the Projects list.”

Once the consumer claims to be a unified access surface, those messages become materially misleading and should be remediated with core behavior, not treated as late-stage cleanup.

## Severity summary

### P0
- Fallback-only records can never surface

### P1
- No explicit merged-record identity/key namespace
- No dedicated merged-source resolver seam
- Browse authority remains Projects-only
- Consumer join authority ignores richer approved-linkage fields already present in the registry

### P2
- Consumer-side fallback descriptor seam is still thinner than the governed registry
- Normalization and hook semantics still assume Projects-origin rows
- Filter/search/facet model is not source-aware
- User-facing empty/error/context copy is not yet merged-source truthful
- Regression coverage is incomplete

### P3
- Comments/docs still describe a Projects-list browser
- Optional provenance/support diagnostics could be stronger

## Final judgment

The attached packages should **not** be discarded as wrong.

They should be treated as **good first-pass architectural diagnosis** that stopped short of code-agent-grade closure planning.

The replacement prompt package therefore increases prompt count, tightens issue boundaries, and adds explicit closure proofs.
