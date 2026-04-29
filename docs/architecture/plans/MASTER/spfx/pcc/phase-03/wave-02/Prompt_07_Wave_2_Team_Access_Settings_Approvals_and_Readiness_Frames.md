# Prompt 07 — Wave 2 Team & Access, Settings, Approvals, and Readiness Frames

## Operating Instructions

You are executing this prompt in the live `RMF112018/hb-intel` repository. Treat the current repo as the source of truth. Do not assume files from memory are current. However, do not repeatedly re-read files that are still within your current context unless the file may have changed or the prompt specifically requires a freshness check.

Work to closure. Do not defer required analysis, do not ask broad clarification questions, and do not implement outside the allowed scope. If repo truth conflicts with this prompt, stop before code changes and document the conflict clearly.

## Objective

Implement preview frames for Team & Access, Control Center Settings, Approvals, and Project Readiness surfaces. These surfaces must show credible UI/UX shape without executing any workflow or mutation.

## Team & Access

Implement:

- team snapshot;
- internal/external/guest summary counts;
- access request entry placeholder;
- permission-template preview language;
- no group/permission mutation.

## Control Center Settings

Implement:

- settings overview cards;
- project/site/persona/integration scope labels;
- missing-configuration preview items;
- no settings persistence or tenant mutation.

## Approvals

Implement:

- approval/checkpoint counts;
- pending my approval preview;
- pending others preview;
- submitted/recently approved preview;
- no approval execution.

## Project Readiness

Implement:

- readiness score/summary;
- People & Access readiness;
- Documents & Information readiness;
- Processes & Workflows readiness;
- Systems & Integrations readiness;
- no backend rollup.

## Validation

Add tests confirming each surface renders, uses preview data only, and has no live execution path.

Run package validation commands.

## Closeout

Create `Wave_2_Prompt_07_Closeout.md` with preview-frame coverage and guardrail confirmations.
