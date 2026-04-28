# HB Central Leadership Message Foleon Reader Rescue

**Date:** 2026-04-27  
**Scope:** Repo-truth audit, screenshot-hosted UI/UX assessment, subject-matter research, remediation plan, and prompt package for the Leadership Message Foleon reader lane.  
**Status:** Planning / code-agent implementation package. No production code is changed by this package.

> Audit boundary: this package is based on the live `main` branch inspected through GitHub connector access, the user-provided hosted screenshot, and public subject-matter research. Hosted validation was screenshot-based only; no authenticated browser automation was run against the tenant in this session.


## Current-State Failures

### 1. Product language failure

The visible title `Leadership Message reader` is not employee-facing. It describes the component, not the content. On a homepage, this makes the reader feel like a web part preview, not a leadership communication.

Replace with one of:

- `A message from leadership`
- `Latest leadership update`
- actual Foleon headline
- `Quarterly leadership message`
- `Open the latest leadership message`

### 2. Hierarchy failure

The current visual sequence gives similar weight to:

- lane label;
- cadence chip;
- preview chip;
- title;
- summary;
- byline;
- quote;
- message body;
- context notes.

That creates no reading path. The user should see:

1. message identity/status;
2. headline;
3. summary/key point;
4. CTA;
5. small context metadata.

### 3. Fake-content failure

The preview state uses sample content as if it were editorial content:

- `Sample executive byline`
- `Sample role`
- `Sample pull quote`
- `Sample message body`
- `Sample audience`

This does not look like intentional preview scaffolding. It looks unfinished.

### 4. Metadata leakage

`Audience`, `Cadence`, and `Archive group` are not automatically useful to employees. They should not be shown unless they are rewritten and contextualized.

Recommended handling:

- `Audience: Companywide` may be omitted.
- Targeted audiences may be shown as `For field teams`, `For operations leaders`, etc.
- `Cadence` should be omitted.
- `Archive group` should never be shown to employees. Use it only for archive filtering.

### 5. Weak CTA

The title button is technically actionable, but there is no visible CTA. A Foleon access point must tell the employee what action to take and what will happen.

Required CTA patterns:

- `Read the leadership message`
- `Open full message`
- `Watch the message`
- `Open in Foleon`
- `Open in a new tab` for external-only records.

### 6. Ready-state absence problem

`Executive byline not provided.` is unacceptable in production. It is an implementation fallback, not useful employee copy.

Replace with:

- omit the block entirely; or
- show `From leadership` only if that source label is governed; or
- show a neutral office/source label such as `Leadership update` when no person-level identity exists.

### 7. Article-body ownership confusion

The layout currently renders `messageBody` from summary/fallback logic. This makes HB Intel appear to publish the leadership message body. The full message lives in Foleon. HB Intel should render a teaser/summary only.

### 8. Visual personality failure

Leadership should feel calm, credible, executive-grade, and editorial. The current layout reads as generic text with badges. It lacks:

- a defined feature surface;
- source/identity zone;
- CTA rail;
- controlled line length;
- status model;
- premium typography rhythm;
- composed negative space.

### 9. State-model failure

The current preview state is too prominent and too literal. The lane needs distinct states:

- live/current;
- scheduled/future;
- preview-only;
- no live message;
- blocked/unavailable;
- external-open-only;
- expired/archived.

### 10. Test coverage failure

Current tests validate markers, viewer mechanics, and single-control card pattern. They do not enforce:

- removal of `Leadership Message reader` from visible production/preview headings;
- absence of `Sample executive byline`;
- visible CTA label;
- no fake article body;
- no `Executive byline not provided.` in production DOM;
- no `Archive group` visible to employees.
