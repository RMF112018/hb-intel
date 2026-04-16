# Prompt 04 — Harden key governance, duplicate detection, and schema authority

## Objective

Harden the current text-key publisher model so backend reads and writes are no longer blindly trusting first-match behavior where the checked-in schema evidence does not prove uniqueness or indexing.

This is both a code hardening task and a schema-authority task.

## Why this matters technically

The current publisher model is intentionally text-key based across multiple lists:

- `ArticleId`
- `BindingId`
- `TeamMemberId`
- `MediaId`
- `TemplateKey`
- `RuleId`
- `HistoryId`
- `ErrorId`

That model can be durable, but only if its key contract is explicit and enforced.

Repo truth still has several weak seams:

- `publisherRepositories.ts` frequently reads by key and takes the first row
- `pageBindingWriter.ts` looks up existing rows by `ArticleId` and takes the first match
- the checked-in tenant schema report does not prove custom indexing or uniqueness on those key columns
- I have not yet proven a stronger checked-in provisioning owner for those uniqueness/index settings

That is still too weak for closure-grade backend governance.

## Governing repo surfaces

At minimum inspect and keep aligned:

- `apps/hb-publisher/src/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-publisher/src/data/publisherAdapter/pageBindingWriter.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherListDescriptors.ts`
- any repo-truth provisioning or schema artifacts that actually own these publisher lists
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current repo-truth reality you must preserve

The existing architecture is still intentionally based on text-key relationships.
Do not widen this prompt into a speculative full-lookup-column redesign unless repo truth clearly proves that was already the intended path.

Your job here is to harden the current architecture, not to escape it.

## Exact defects to close

### Defect A — missing authoritative schema owner for key enforcement
The repo contains a tenant schema report, but no clearly proven authoritative checked-in provisioning owner has yet been established for uniqueness/index settings. That leaves the key contract too soft.

### Defect B — first-match blind trust in critical reads/writes
Current key reads and binding upserts can still accept the first matching row rather than fail closed on duplicates.

### Defect C — schema evidence does not prove indexing/uniqueness for critical keys
The checked-in schema report currently shows no visible custom indexed or unique-enforced publisher key columns.

## Required end state

Implement a bounded but concrete hardening of the current text-key model.

Required outcome:

1. identify the real authoritative schema/provisioning owner for these publisher lists if it exists in repo truth
2. if that owner does not exist in a durable form, create an explicit authoritative schema path now rather than leaving the contract implicit
3. define the intended uniqueness/index posture for critical keys
4. harden code-side behavior so duplicate matches fail closed on critical paths
5. update docs/schema authority so future drift is easier to detect

## Minimum key set to address

At minimum address the contract for:

- `HB Articles.ArticleId`
- `HB Article Destination Pages.BindingId`
- `HB Article Destination Pages.ArticleId`
- `HB Article Team Members.TeamMemberId`
- `HB Article Media.MediaId`
- `HB Article Template Registry.TemplateKey`
- `HB Article Promotion Rules.RuleId`
- `HB Article Workflow History.HistoryId`
- `HB Article Publishing Errors.ErrorId`

Also review whether `ArticleId` should be indexed across all child lists that query by it.

## Implementation guidance

### Schema authority
You must not leave this as “the schema report says maybe.”
Either:

- locate the actual provisioning owner and harden it, or
- introduce a clearly authoritative schema artifact and document that it now owns the key contract

### Code hardening
Critical control-plane reads/writes must not silently accept duplicate matches.

Likely examples:
- `articles.getByArticleId`
- `pageBindings.getByArticleId`
- `templateRegistry.getByKey`
- `pageBindingWriter.findExistingItemId`

For critical identity/control-plane reads, duplicates should generally fail closed.
For list scans or optional child reads, you may collect diagnostics instead of immediately throwing, but the behavior must be explicit and tested.

### SharePoint-specific posture
Use the strongest practical uniqueness/index strategy the current list architecture supports.
Where SharePoint unique constraints are possible, use them.
Where they cannot be assumed immediately, add code-side duplicate detection and truthful failure behavior.

## Non-negotiable rules

- do not leave duplicate ambiguity as “pick the first row”
- do not treat the checked-in schema report as sufficient proof of enforcement if it does not actually prove enforcement
- do not convert this into a broad lookup-column migration unless repo truth truly requires it
- do not leave key authority split across comments, one-off scripts, and tribal knowledge

## Test requirements

Prove closure with tests that cover at minimum:

1. duplicate current-binding rows by `ArticleId` are detected and do not silently bind the first match
2. duplicate template rows by `TemplateKey` are detected and do not silently select the first match
3. duplicate master rows by `ArticleId` are handled truthfully on control-plane reads
4. normal single-row reads and writes still work
5. schema authority / docs clearly state the intended key contract

## Closure notes required

Write concise closure notes that state:

- what now acts as the authoritative schema owner
- which keys are intended to be unique and/or indexed
- where duplicate detection now fails closed
- which tests prove first-match blind trust is gone from critical paths
