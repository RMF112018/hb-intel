# README — HB Kudos Companion P2 Prompt Package

## Purpose

This package covers all **Priority 2** issues from the doctrine-aligned audit of the **HB Kudos Companion**.

These prompts assume the P0 and P1 packages have already been executed or are otherwise sufficiently closed.

## Package contents

- `Plan-Summary.md`
- `Prompt-01-P2-Responsive-Hosted-Condition-Hardening.md`
- `Prompt-02-P2-Queue-Row-Anatomy-and-Metadata-Normalization.md`
- `Prompt-03-P2-Surface-Family-Boundary-and-Ownership-Tightening.md`

## Execution order

Execute the prompts in numeric order.

Do not skip ahead unless a prompt explicitly says it is safe to do so.

## Package philosophy

This package is a **hardening and refinement package**, not a foundational rewrite package.

It focuses on:

- explicit responsive behavior for hosted SharePoint conditions
- stable row structure and metadata consistency
- cleaner ownership boundaries between public and Companion runtimes

## Important guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not broaden scope into unrelated public-webpart redesign work.
- Do not undo or weaken P0/P1 structural improvements.
- Do not use brittle CSS or DOM tricks as the primary responsive solution.
- Do not reduce shared runtime discipline in the name of convenience.

## Expected deliverable from the code agent

For each prompt, the code agent should report:

- what it changed
- what files were touched
- why the change was necessary
- how the result remains aligned with the locked doctrine

## Recommended follow-up

After this P2 package is executed, run a dedicated closure / validation package before declaring the Companion audit wave complete.
