# Prompt 09 — Clean up current-scope product identity and destination truth

## Objective

Remove the remaining ambiguity between the broad “Article Publisher” product identity and the narrower current runtime truth that the live implementation is still effectively Project Spotlight-oriented.

## Why this issue matters

Repo truth currently shows a real tension:
- the product is named broadly as **Article Publisher**
- the manifest and runtime preserve a stable lineage from an older Project Spotlight-specific identity
- the runtime currently defaults to and actively supports `projectSpotlight`
- unsupported destinations are explicitly blocked
- some user-facing copy still implies or enumerates broader destination support than the current live runtime actually provides

Wave 01 must leave this state truthful.

## Governing authority / required references

- live local repo mirroring `main` in `RMF112018/hb-intel`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- the attached Wave 01 audit package, especially:
  - `00-Audit-Summary.md`
  - `01-Repo-Truth-Implementation-Map.md`
  - `03-UI-UX-Findings-Register.md`
  - `04-Prioritized-Enhancement-Plan.md`

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `apps/hb-publisher/src/webparts/articlePublisher/runtimeContract.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/draftPolicyHelpers.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/authorLabels.ts`
- `apps/hb-publisher/src/data/publisherAdapter/*` where destination support/default behavior is defined
- any user-visible copy or labels that narrate supported destinations or current product scope

Before making changes, conduct an exhaustive scrub of the full affected path and any directly coupled seams those files call into.

Do **not** re-read files already in active context unless you need to confirm drift, dependencies, contradictions, or uncertainty after new findings.

## Current-state problem description

The live product is broader in name than it is in current runtime support.
That is acceptable **only if the user-facing surface is truthful about the current release scope**.
Right now, that truth is not as clean as it should be.

## Required implementation outcome

Choose and implement one coherent current-release answer.

For Wave 01, the default expectation is:
- keep the product identity as **Article Publisher**
- keep the stable deployment/runtime lineage intact
- narrate the current release truth clearly as **current-scope Project Spotlight publishing**, with unsupported destinations remaining explicit and truthful

Do **not** imply broader destination support unless you actually implement it now and close it completely.

At minimum:

1. clean user-facing copy that currently over-implies destination scope
2. keep unsupported-destination behavior truthful and explicit
3. preserve the stable GUID and deployment identity lineage
4. remove avoidable confusion from manifest/runtime comments and author-facing surface copy
5. leave the runtime in a state that a new author would interpret correctly without insider context

## Dependencies / cross-surface considerations

- queue empty states, canvas kickers, manifest description, readiness copy, and destination labels must not contradict each other
- do not break stable deployment identity while cleaning product language
- do not widen scope into true multi-destination implementation unless you fully close it now

## Validation / proof-of-closure requirements

Prove all of the following:

- user-facing copy and runtime behavior no longer contradict each other
- unsupported-destination messaging remains truthful
- no accidental scope expansion is implied without real implementation
- stable manifest/runtime identity is preserved
- a new user can understand the current supported scope from the live product itself

## Deliverables / closure artifacts

- code changes required for closure
- any narrowly necessary tests or validation updates
- a concise closure note summarizing:
  - what current-scope truth was chosen
  - what copy/comment/runtime surfaces changed
  - what was intentionally preserved for deployment identity stability

## Explicit non-goals

- do not rename or replace the stable deployment GUID
- do not imply multi-destination support without fully implementing it now
- do not widen scope into unrelated branding work
