# Plan Summary

## Objective
Close the Publisher app defects identified by the repo-truth audit in the correct operational order, starting with workflow safety and ending with schema-completeness gaps.

## Closure order
1. Publish-path transactionality / orphan-page risk
2. Archive / withdraw / manual-transition atomicity
3. Scheduled-state gap
4. Milestone branch closure or removal
5. Promotion-rule behavior
6. Advanced `HB Articles` presentation-field mapping
7. Team-member authoring completeness

## Dependency notes
- Prompt 01 should be closed before Prompt 02 because both touch lifecycle safety patterns.
- Prompt 03 should be closed before any broader destination/workflow expansion.
- Prompt 04 should be closed before widening content-type affordances.
- Prompt 06 should be closed before Prompt 07 so master-row presentation intent is stable before expanding child authoring.

## Required operating instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
