# Prompt 07 — Final Audit and Closure

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repo.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, or prior assumptions when source files are available. Do not re-read files that are still within your current context or memory unless you need verification.

Follow all existing repo governance, UI doctrine, package-version authority, and SPFx build/package proof standards.

Do not implement unrelated changes. Do not change Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon iframe governance, or Foleon routes unless this prompt explicitly instructs you to do so.

## Objective

Conduct a final closure audit of the implemented Foleon reader composition redesign and edge-to-window behavior.

## Required Closure Checks

Verify:

1. Repo-truth implementation matches the approved architecture.
2. Project Spotlight, Company Pulse, and Leadership Message have distinct composition frames.
3. Preview and production share lane-specific composition.
4. Preview remains clearly labeled.
5. Foleon iframe governance remains unchanged.
6. SharePoint list schemas remain unchanged.
7. Edge bleed is based on shell visual side, not DOM order.
8. Company Pulse correctly bleeds right in the right-dominant Row 2 pairing.
9. Stacked/mobile layouts bleed both sides without horizontal overflow.
10. Hero edge-to-window behavior is either implemented with proof or documented as not safely implemented in this pass.
11. Tests and package proof are complete.
12. Hosted proof is complete or explicitly marked not run.

## Required Output

Create:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/07_CLOSURE_REPORT.md
```

Use this exact final format:

```md
# Closure Report

## Summary

## Files Changed

## Repo-Truth Findings

## Implemented Architecture

## Project Spotlight Result

## Company Pulse Result

## Leadership Message Result

## Edge-to-Window Result

## Hero Result

## Tests Run

## Package Proof

## Hosted Proof

## Known Gaps

## Rollback Plan

## Commit Summary

## Commit Description
```

## Commit Summary / Description Template

```text
Summary: HbHomepage Foleon readers: add lane-specific layouts and shell edge-bleed contract

Description:
Adds lane-specific Foleon reader layout architecture for Project Spotlight, Company Pulse, and Leadership Message while preserving preview fallback, production iframe governance, and homepage shell placement contracts. Introduces shell visual-side / edge-bleed data attributes for safe paired and stacked edge integration, updates tests and package proof, and documents hosted validation results.
```
