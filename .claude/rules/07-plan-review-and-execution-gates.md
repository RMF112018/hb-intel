# 07-plan-review-and-execution-gates

## Intent

Support Bobby's implementation oversight workflow with a clear pre-execution and post-execution gate.

## Agent plan mode

When a task is prompt-package-driven, phase/wave-driven, risky, cross-cutting, or touches architecture, SPFx shell behavior, backend, provisioning, deployment, permissions, Graph/PnP, Procore, or CI/CD:

1. Produce an implementation plan first.
2. Do not execute until the user approves or explicitly says to proceed.
3. Include:
   - files to inspect;
   - files likely to modify;
   - files forbidden;
   - governing docs;
   - validation commands;
   - risks;
   - assumptions;
   - expected commit summary/description.

## Execution mode

After approval:
- execute only the approved scope;
- do not expand into adjacent cleanup unless explicitly authorized;
- do not stage unrelated files;
- do not push unless explicitly instructed.

## Completion report

Every execution report must include:
- files inspected;
- files modified;
- validation commands run;
- validation results;
- known gaps or uncertainty;
- guardrails preserved;
- commit summary;
- commit description.

## Claims are not proof

Do not claim repo-truth completion without verifying current files and command results.