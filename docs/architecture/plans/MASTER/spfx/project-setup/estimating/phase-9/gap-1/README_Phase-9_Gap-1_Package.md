# Phase 9 — Gap 1 SPFx Permission Declaration Resolution Package

## Objective

This package breaks the Gap 1 remediation effort into an ordered set of local code-agent prompts focused exclusively on closing the confirmed SPFx permission declaration gap for the Project Setup Requests package.

Gap 1 summary:
- The authoritative estimating `package-solution.json` does not currently declare `solution.webApiPermissionRequests`.
- The Project Setup frontend is designed to use SPFx-based audience-scoped token acquisition in production mode.
- No packaging or build step injects the missing declaration later in the pipeline.
- The standard SharePoint API access approval flow therefore cannot be triggered through the package as currently implemented.

## Package contents

### Core package documents
- `Phase-9_Gap-1_Resolution-Summary.md`
- `Phase-9_Implementation-Plan.md`
- `README_Phase-9_Gap-1_Package.md`

### Prompt sequence
- `Prompt-1-Resolve-Api-Permission-Inputs-and-Freeze-Decision.md`
- `Prompt-2-Implement-SPFx-Permission-Declaration.md`
- `Prompt-3-Build-and-Verify-Package-Propagation.md`
- `Prompt-4-Reconcile-Deployment-Docs-and-apiAudience-Narrative.md`
- `Prompt-5-Close-Gap-1-and-Issue-Final-Implementation-Record.md`

## Execution order

Run the prompts in strict order.

1. **Prompt 1** determines the exact permission request values and freezes the implementation inputs.
2. **Prompt 2** applies the actual manifest change in the authoritative source file.
3. **Prompt 3** rebuilds and verifies the packaging path and deployable artifact truth.
4. **Prompt 4** reconciles the deployment and remediation documentation, including the `apiAudience` contradiction.
5. **Prompt 5** issues the final closure record and identifies any residual external/operator prerequisites.

## Scope guardrails

This phase is intentionally narrow.

Included:
- SPFx permission request declaration
- custom API `resource` and delegated `scope` determination
- package build verification
- documentation truth reconciliation directly related to Gap 1
- final closure record

Excluded unless directly required to resolve a blocker:
- general auth redesign
- RBAC redesign beyond documenting the exact current requirement
- backend refactors unrelated to permission declaration
- broad SharePoint provisioning architecture changes
- unrelated production-hardening items from other gaps/phases

## Working expectations for the local code agent

- Treat live repo truth as authoritative.
- Treat the current validation report as the starting point, not infallible truth.
- Do not re-read files that are already in active context or memory unless needed to verify a contradiction, capture exact evidence, or make a precise edit.
- Do not guess the API `resource` or delegated `scope`.
- Stop and document a blocker if the exact values cannot be determined truthfully.
- Keep edits minimal, auditable, and tightly scoped.
- Rebuild and inspect the package before claiming closure.

## Expected outcomes

By the end of Phase 9, repo truth should show:
- the correct `solution.webApiPermissionRequests` declaration in the authoritative estimating package config
- packaging-path proof that the declaration survives into the deployable artifact flow
- deployment/operator docs that describe the SharePoint API access approval sequence truthfully
- a reconciled narrative regarding whether `apiAudience` is currently injected by the shell or remains a carry-forward gap
- a final Gap 1 closure record suitable for architecture and deployment decision-making

## Notes on numbering

Prompt files begin at `Prompt-1-*` and increment by task order. The numbering is intended to reflect execution order and dependency sequence.
