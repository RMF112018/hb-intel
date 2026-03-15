# Documentation Authoring Standard

Purpose: define the quality bar for HB Intel developer-facing documentation so agents produce documentation that is useful, maintainable, and correctly placed.

## Core principle

Documentation should make the next correct action easier for a future developer.
Write only the amount needed to clarify ownership, behavior, workflow, or rationale.
Avoid ceremony, drift, and duplication.

## Placement standard

Use `docs/README.md` and the repo's document classification guidance to place content in the right location.

Default targets:
- package or app `README.md` for local ownership, exports, commands, and implementation notes,
- `docs/how-to/` for procedures and task-oriented guidance,
- `docs/reference/` for command reference, facts, configuration, and authoritative lookup material,
- `docs/explanation/` for rationale, design decisions, and conceptual framing,
- ADRs for durable architecture decisions or reversals,
- release notes only when the change should be tracked as a user- or stakeholder-facing release entry.

## Writing standard

Documentation should be:
- accurate,
- current,
- concise,
- specific to the actual changed scope,
- written for the intended audience,
- anchored in canonical sources,
- easy to scan.

Prefer:
- short sections with clear headings,
- precise statements over slogans,
- concrete commands and file paths,
- direct links or references to canonical docs,
- examples only when they improve understanding.

Avoid:
- repeating large blocks of architecture doctrine,
- copying plan text into permanent docs,
- vague statements such as "supports everything" or "works seamlessly",
- stale TODO-style prose with no owner or follow-up path,
- changelog noise inside stable reference documents.

## Audience standard

Choose the tone and depth based on audience:

### Package or app README
Optimize for developers working directly in that area.
Include:
- purpose,
- ownership or responsibility,
- public exports or major entry points,
- important commands,
- local implementation notes,
- links to related docs or ADRs when helpful.

### Developer how-to guide
Optimize for task completion.
Include:
- prerequisites,
- step-by-step actions,
- expected outcome,
- troubleshooting or common mistakes when useful.

### Reference doc
Optimize for fast lookup.
Include:
- exact commands,
- options,
- constraints,
- routing guidance,
- factual statements only.

### Explanation doc
Optimize for understanding and decision support.
Include:
- why the approach exists,
- what tradeoffs matter,
- what not to infer,
- links to the operational or reference docs that implement the idea.

## Documentation update triggers

Update documentation when work changes:
- public APIs or exports,
- package ownership or package boundaries,
- developer workflow,
- architecture or governance,
- user-visible behavior that existing docs describe,
- required commands or verification steps,
- major assumptions a future developer would otherwise miss.

Documentation updates are usually not needed for:
- purely internal refactors with no workflow or behavior impact,
- trivial rename-only changes already obvious from code and existing docs,
- hyper-local implementation detail that is better expressed in code and tests.

## README minimum standard

For mature packages and apps, keep `README.md` current with:
- purpose,
- key entry points or public exports,
- commands used locally,
- major dependencies or shared package relationships when relevant,
- implementation notes that are not obvious from the code,
- links to governing docs when useful.

## Canonical-source rule

When information already has a stable canonical home:
- update the canonical source,
- link to it from nearby docs if needed,
- do not clone the same explanation into multiple files unless the local context truly requires a short summary.

## Quality checklist

Before finishing a docs update, confirm:
- the doc is in the right place,
- the audience is clear,
- commands and paths are accurate,
- statements match current repo truth,
- the content explains what changed or what matters,
- duplicated prose was avoided,
- related docs were updated only when needed.

## Preferred documentation style for agents

When an agent writes or updates docs:
- keep the document proportional to the change,
- preserve existing structure when it is healthy,
- improve weak structure when it blocks clarity,
- prefer high-signal additions over broad rewrites,
- leave the doc better than it was found.
