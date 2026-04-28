# HB Central Leadership Message Foleon Reader Rescue

**Date:** 2026-04-27  
**Scope:** Repo-truth audit, screenshot-hosted UI/UX assessment, subject-matter research, remediation plan, and prompt package for the Leadership Message Foleon reader lane.  
**Status:** Planning / code-agent implementation package. No production code is changed by this package.

> Audit boundary: this package is based on the live `main` branch inspected through GitHub connector access, the user-provided hosted screenshot, and public subject-matter research. Hosted validation was screenshot-based only; no authenticated browser automation was run against the tenant in this session.


## Executive Summary

The Leadership Message reader currently renders, but it is not product-quality. It presents as a loose stack of labels, sample text, and internal metadata rather than a premium executive communication access point.

The primary failure is not only CSS. The product model is wrong:

- The reader is trying to look like a partial article body even though the primary article is owned and authored in Foleon.
- The current title and labels use developer/product language such as `Leadership Message reader` and `Preview layout`.
- The view model injects preview placeholders such as sample executive byline, sample role, sample pull quote, sample message body, sample audience, and cadence.
- Ready state exposes absence as copy, e.g. `Executive byline not provided.`, which is honest technically but weak as employee-facing UX.
- Context notes such as `Audience`, `Archive group`, and `Cadence` are treated as visible content even when they do not help the employee decide whether to open the Foleon message.
- The launch path is hidden inside the headline button. There is no strong visible user-centered CTA such as `Read the leadership message`, `Open full message`, or `Watch the message`.
- The lane lacks the clear visual and editorial identity now present in Project Spotlight and Company Pulse.

## Recommended Product Model

Use the Leadership Message reader as a **premium HB Central access point** into a Foleon-managed leadership communication.

The reader should answer, in order:

1. What is this?  
2. Who or what office is it from, if known?  
3. Why should I open it?  
4. Is it current, preview-only, expired, blocked, or external-open-only?  
5. What will happen when I open it?

It should **not** pretend to publish the full leadership message inside HB Intel.

## Recommended Layout Concept

Adopt a hybrid of:

- **Concept A — Executive Letter Feature** for calm executive authority.
- **Concept C — Leadership Briefing Card** for homepage density and clarity.

Working name: **Executive Briefing Feature**.

### Target first-view sequence

```text
[A message from leadership] [Current / Preview / Archived] [Published date]

Headline from Foleon
One-to-two sentence editorial summary / teaser from governed metadata.

Optional: real pull quote only if a real field exists.
Optional: executive/source identity only if real metadata exists.

[Read the leadership message]  [Open in Foleon if external-only]

Small restrained context:
Published Apr 2026 · Companywide · Strategy / Operations
```

## Quality Bar

The target acceptance standard is not “it renders.” The target is homepage-grade, with a path to flagship quality:

- no developer-facing copy in production;
- one clear visual hierarchy;
- no fake article body;
- explicit status model;
- visible primary CTA;
- no internal metadata leakage;
- accessible launch and focus return;
- stable hosted behavior at 100%, 75%, mobile/narrow, and short-height;
- evidence-backed package proof.

## Package Contents

| File | Purpose |
|---|---|
| `01_REPO_TRUTH_AUDIT.md` | Repo-truth findings from inspected source files. |
| `02_SUBJECT_MATTER_RESEARCH.md` | Research synthesis and practical design rules. |
| `03_CURRENT_STATE_FAILURES.md` | Blunt current-state failure register. |
| `04_PRODUCT_DEFINITION.md` | Product model and lane ownership boundaries. |
| `05_RECOMMENDED_LAYOUT_CONCEPTS.md` | Three layout concepts plus recommendation. |
| `06_TARGET_INFORMATION_ARCHITECTURE.md` | Target IA and field hierarchy. |
| `07_WIREFRAMES_AND_STATES.md` | State-specific text wireframes. |
| `08_COPY_AND_CONTENT_RULES.md` | Production-safe copy and forbidden language. |
| `09_DATA_DISCIPLINE_AND_SCHEMA_GAPS.md` | Field classification and schema gaps. |
| `10_TECHNICAL_IMPLEMENTATION_PLAN.md` | Proposed implementation structure. |
| `11_ACCESSIBILITY_AND_BREAKPOINT_CONTRACT.md` | Accessibility and responsive behavior requirements. |
| `12_TEST_AND_PACKAGE_PROOF_PLAN.md` | Required tests, package proof, and hosted validation matrix. |
| `13_FINAL_ACCEPTANCE_CRITERIA.md` | Non-negotiable acceptance criteria. |
| `prompts/01_build_leadership_message_view_model.md` | Code-agent prompt for lane view model rebuild. |
| `prompts/02_rebuild_leadership_message_layout.md` | Code-agent prompt for layout rebuild. |
| `prompts/03_state_copy_accessibility_breakpoints.md` | Code-agent prompt for state/copy/a11y/breakpoints. |
| `prompts/04_tests_package_and_hosted_proof.md` | Code-agent prompt for tests, packaging, and hosted proof. |

## Next Steps

1. Run Prompt 01 to rebuild the data/view-model contract without changing visible layout yet.
2. Run Prompt 02 to rebuild the visual composition behind the new view model.
3. Run Prompt 03 to harden state copy, accessibility, and breakpoint behavior.
4. Run Prompt 04 to add test coverage, package proof, and hosted screenshot evidence.
