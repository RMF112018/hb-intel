# Prompt 03 — Handoff, persistence, and post-closure governance

## Objective

Define how HB Kudos must be treated after closure so it remains stable, governed, and reference-quality rather than slowly drifting back into the same issues identified in the audit.

## Repo source of truth

Repo:
- `https://github.com/RMF112018/hb-intel.git`

Branch:
- `main`

## Required governance topics

### 1. Preservation rules
Define what future changes to HB Kudos must preserve, including:
- doctrine compliance
- homepage import discipline
- real icon/token/variant posture
- runtime decomposition gains
- experience cohesion gains
- accessibility-system gains
- host-safe behavior
- mount / manifest / package integrity

### 2. Modification rules
Define what kinds of future changes should trigger:
- targeted re-audit
- wave-level regression checks
- packaging validation
- harness/runtime validation

### 3. Model-surface expectation
Since HB Kudos is intended to be reference-quality after closure, future contributors must know that it is not an ordinary webpart with a low quality bar.

### 4. Handoff standard
The repo should have a clear understanding of:
- what makes HB Kudos “done”
- what must be revisited when it changes
- what kinds of shortcuts are not acceptable going forward

## Required implementation direction

### 1. Produce durable post-closure rules
These rules should be concise, enforceable, and aligned with the earlier waves.

### 2. Keep them practical
Do not create bloated governance prose.
Create rules that can realistically guide future contributors and code agents.

### 3. Make regression ownership explicit
Future changes must not be allowed to silently erode:
- doctrine compliance
- UI-layer maintainability
- interaction quality
- SharePoint-hosted resilience

## Constraints

- Do not invent a new platform governance framework unrelated to HB Kudos.
- Do not reopen implementation work unless you find a real blocker to durable handoff.
- Do not rely on vague “best practices” wording without concrete preservation rules.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not leave HB Kudos with no post-closure protection against drift.
- Do not write handoff rules that are so abstract they will not be followed.

## Deliverable

Produce a concise HB Kudos post-closure governance note that includes:
- what must always be preserved
- what kinds of future changes require targeted revalidation
- what makes HB Kudos different from an ordinary low-bar homepage webpart
- how future contributors should avoid reintroducing the original audit failures
