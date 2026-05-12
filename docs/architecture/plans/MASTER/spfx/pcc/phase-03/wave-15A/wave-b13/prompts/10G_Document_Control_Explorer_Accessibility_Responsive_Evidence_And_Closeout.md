# Phase 08 Prompt 10G — Document Control Explorer Accessibility, Responsive Evidence, and Closeout

## Role

You are implementing **Phase 08 Prompt 10G** in the `RMF112018/hb-intel` repo.

This is the final quality/evidence prompt for the Document Control explorer sequence.

---

## Objective

Finalize the Document Control Explorer with:

- accessibility review and remediation;
- responsive behavior validation;
- screenshot/evidence requirements;
- regression tests;
- final closeout against the Prompt 10 target architecture.

---

## Critical Parallel-Work Rule

Project Home work may be occurring in parallel.

Do not disturb it. If evidence/test harness files contain parallel Project Home changes, preserve them and make only the narrowest Documents-specific additions required by this prompt.

---

## Required Preflight

1. Record current branch, HEAD, git status, lockfile md5.
2. Confirm Prompts 10B–10F are present and green.
3. Classify any drift, including parallel Project Home drift.
4. Confirm the Documents ready path now reads as an explorer-first surface.

---

## Accessibility Review Requirements

Audit and correct, where needed:

### Source rail
- labeled navigation region;
- keyboard-accessible source roots;
- visible selected state;
- selected-state semantics.

### Breadcrumbs
- accessible breadcrumb structure;
- prior segments keyboard operable;
- current segment not falsely interactive.

### Main content rows
- appropriate row semantics;
- folder/category row controls accessible;
- no false active interaction on disabled/preview-only controls.

### Disabled / launch-only / read-only reason copy
- visible enough for end users;
- available to assistive technology where applicable.

### Focus behavior
- after source switch, focus handling must remain sensible;
- after breadcrumb traversal, focus should not disappear into nowhere;
- do not introduce keyboard traps.

---

## Responsive Acceptance Requirements

Validate the explorer at minimum across the app’s relevant responsive modes / representative sizes where existing harness support exists.

Required product checks:
1. Desktop/laptop:
   - source rail persistently visible;
   - one-click source switching from deep folder depth.
2. Standard or constrained laptop:
   - no clipped rail;
   - no unusable breadcrumb overflow;
   - main pane remains legible.
3. Tablet/phone posture:
   - source switching remains discoverable;
   - no global sidebar introduced;
   - main pane remains primary.

If the current test/evidence harness cannot capture all modes, document the blocked reason clearly and capture what is available.

---

## Screenshot / Evidence Targets

Capture or update evidence sufficient to support the “explorer-first” claim.

Minimum desired visual states:
1. Document Control Home.
2. Project Record root.
3. Project Record several folders deep with source rail still visible.
4. One-click source switch result: Procore root or category view after deep Project Record traversal.
5. My Project Files guardrail state.
6. Procore launch-only/no-writeback directory posture.

If hosted/live screenshot evidence is not available in the execution environment:
- state that explicitly;
- capture the strongest local/test evidence available;
- do not claim visual completion without evidence.

---

## Regression Test Review

Ensure tests cover:
- explorer shell existence;
- source rail roots;
- Project Record deep traversal;
- one-click cross-source switching;
- mounted-path retention per source;
- active-module focus mapping;
- Procore category directory;
- external references not promoted to roots;
- ready-path legacy card retirement;
- no full OneDrive root exposure;
- shell-owned active-panel marker;
- bento direct-child invariant.

Add/fix tests only where needed. Do not weaken existing contracts to pass.

---

## Required Validation

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If live Playwright or screenshot commands are available and already used by the current PCC evidence package, run the applicable Document Control evidence lane. If environment/auth is missing, document the exact blocked reason.

---

## Final Closeout Requirements

Return a formal closeout with:

1. **Verdict**
   - `PASS`
   - `PASS WITH EVIDENCE LIMITATION`
   - `BLOCKED`

2. **Starting / ending HEAD**

3. **Files changed**

4. **Prompt 10 architecture checklist**
   - explorer-first ready path;
   - in-surface source rail;
   - one-click source switching;
   - Project Record fixture browsing;
   - My Project Files guardrail;
   - Procore directory posture;
   - legacy card retirement;
   - accessibility posture;
   - responsive posture.

5. **Validation results**

6. **Evidence generated / blocked reason**

7. **Lockfile md5 before/after**

8. **Parallel Project Home preservation statement**

9. **Any remaining explicitly bounded follow-on items**
   - only if real;
   - do not invent broad TODOs.
