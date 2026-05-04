# Master Prompt — PCC Procore Data Layer Wave 13A-13F Remediation Implementation

## Objective

You are working in the `hb-intel` repo. Implement the Procore data-layer remediation sequence as Wave 13A-13F while PCC is progressing through Wave 13 Buyout Log.

Do not re-read files that are still within your current context or memory. If you already inspected a file in this session and no repo changes occurred, use that context and cite it in your closeout.

## Scope

Implement shared contracts, fixtures, mock backend boundaries, read-model seams, fixture-driven SPFx displays, module remediation, tests, and closeout docs necessary for Procore data-layer readiness.

## Hard Boundary

No live Procore runtime. No Procore SDK dependency. No Procore write-back. No full mirror. No direct SPFx-to-Procore. No file/binary replication.

## Required Prompt Sequence

Execute only the staged prompt provided by the operator. Do not jump ahead.

- 13A — Repo Truth and Scope Lock.
- 13B — HB Central Projects Registry + Procore Mapping Contract.
- 13C — Shared Models and Fixtures.
- 13D — Backend Mock Adapter Boundary.
- 13E — SPFx Fixture Integration.
- 13F — Cross-Module Remediation and Closeout.

## Expected Closeout

For each prompt, return:

- Commit summary.
- Commit description.
- Files changed.
- Validation commands and results.
- Lockfile MD5 before/after.
- Guardrails preserved.
- Residual risks.
