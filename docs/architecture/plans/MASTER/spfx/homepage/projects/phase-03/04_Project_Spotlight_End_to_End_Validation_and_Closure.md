# Prompt 04 — Project Spotlight End-to-End Validation and Closure

## Objective

Perform the smallest credible end-to-end validation to confirm both upstream mapping defects are resolved in the packaged SharePoint-hosted Project Spotlight runtime.

This prompt is about proof and closure.

---

## Validation targets

You must prove all of the following:

1. the webpart still uses the SharePoint list as the primary runtime source,
2. a valid list item now produces a visible featured image,
3. a valid list item now produces clean body/summary text rather than escaped HTML,
4. existing image fallback behavior still works when an image is unavailable,
5. the Spotlight layout and interaction model remain materially unchanged.

---

## Required validation steps

### A. Code/build validation

Run the smallest relevant validation commands for the touched scope.
At minimum include:

- type/build verification for the affected homepage package/app scope
- any package-local validation needed to confirm no regression in the changed files

### B. Packaged/runtime validation

Use the real SharePoint-hosted runtime or the closest credible packaged validation path available in repo workflow.

Confirm:

- image panel shows real image content for valid rows,
- summary shows clean editorial text,
- no raw HTML visible in body,
- no normal valid-row path still producing the empty image panel.

### C. Regression check

Confirm that:

- manifest fallback still exists for local/demo use,
- the supporting rail and team strip were not unintentionally refactored,
- no unrelated UI changes were introduced.

---

## Required deliverables

In the closure notes, provide:

1. final root cause recap,
2. files changed across all prompts,
3. validation commands run,
4. runtime proof summary,
5. residual risks (if any),
6. confirmation that scope remained narrow.

---

## Guardrails

- Do not claim success based only on source inspection.
- Do not claim success based only on local dev assumptions.
- Prefer evidence from the packaged SharePoint-hosted output.
