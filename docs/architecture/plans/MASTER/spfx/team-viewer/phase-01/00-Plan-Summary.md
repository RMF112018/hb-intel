# 00 — Plan Summary

## Objective

Create a new premium SPFx homepage people viewer app named `teamViewer` by learning from the **implementation quality** of `hbKudos` public, not by cloning its recognition workflow.

`teamViewer` must be:

- stylized
- premium
- interactive
- SharePoint-hosted safe
- accessible
- architecturally clean
- article-bound
- suitable for showing:
  - photo
  - name
  - job title

It must also be designed to:
- bind to article/team-member records based on host site / page context
- support a real bio/resume slide-out implementation for each team member
- keep that bio/resume feature disabled by default until explicitly enabled

## What the audit proved

The current HB Kudos public app is already a relatively mature homepage benchmark because it combines:

- a thin top-level orchestrator
- focused hooks for discrete concerns
- explicit runtime contracts
- disciplined mount/manifest wiring
- strong loading/empty/error handling
- host-safe layout behavior
- real photo hydration logic
- a premium, purpose-fit interaction surface

At the same time, much of Kudos is recognition-specific and must not flow into `teamViewer`.

## Core recommendation

Build `teamViewer` as a **new standalone webpart** with its own:

- manifest
- mount wiring
- data contracts
- view-model layer
- interaction model
- validation path

Use Kudos only as a source of **transferable patterns**.

## Transferable from Kudos

1. Thin orchestrator posture
2. Extracted hooks by concern
3. Photo hydration / caching pattern
4. Host-safe layout logic
5. Strong loading / empty / error state discipline
6. Semantic shell pattern for any detail drawer / panel
7. Canonical mount + runtime contract rigor
8. `@hbc/ui-kit/homepage`-first import discipline
9. Right-side panel mechanical behavior that can inform the future bio/resume drawer

## Must remain isolated from Kudos

1. Recognition workflow status model
2. Celebrate, submit, archive, resubmit, withdraw, approval, governance flows
3. Recognition-specific predicates
4. Kudos audit event model
5. Kudos recipient contract semantics
6. Kudos-specific surface-family CSS and variants
7. Public/archive/associated visibility rules

## Recommended closure sequence

1. Lock architecture and extraction boundaries
2. Define clean `teamViewer` contracts and source binding
3. Build the premium viewer surface and density variants
4. Implement photo / identity / fallback behavior
5. Wire manifest, mount, and harness validation
6. Close with conformance scoring and hosted proof

## Acceptance standard

The work is only complete when `teamViewer` is:

- doctrine-compliant
- benchmark-grade relative to its own purpose
- clearly not a renamed Kudos clone
- validated in hosted SharePoint-like conditions
- closed with explicit evidence


## Follow-up scope additions now locked

The implementation package must explicitly address:

1. **Article-bound source resolution**
   - `teamViewer` is expected to render article-linked team members sourced from the article system rather than from a generic standalone directory.
   - The preferred planning model is the uploaded article architecture:
     - `HB Articles`
     - `HB Article Team Members`
     - `HB Article Destination Pages`
   - The code agent must determine the cleanest repo-truth binding path from host site/page context to the correct article row, then from the article row to ordered team-member rows.

2. **Bio/resume slide-out**
   - Team members need a real slide-out profile experience.
   - The shell and motion discipline should learn from Kudos’ drawer logic, but the content and persona must remain people-viewer-fit.
   - The feature must be implemented in code and validated, but defaulted to disabled via explicit config / feature flag posture until business activation.
