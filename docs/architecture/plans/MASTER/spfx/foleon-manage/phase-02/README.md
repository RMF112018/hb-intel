---
generated_utc: 2026-04-25T08:26:30Z
package: HB Intel Foleon SPFx list provisioning remediation
repo: RMF112018/hb-intel
target_package_version_observed: 1.0.11.0
uploaded_sppkg_sha256_observed: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
source_audit_basis: Foleon list provisioning audit package generated from current repo/package inspection
---


# HB Intel Foleon List Provisioning Remediation Prompt Package

## Purpose

This package converts the Foleon list provisioning audit into execution-ready prompts for a local coding agent and SharePoint tenant validation agent.

The audit found that the most likely root cause of the corrupted/unloadable SharePoint lists is **schema-level provisioning failure**, led by over-indexing in `HB_FoleonContentRegistry`, with additional risk from a required same-feature lookup in `HB_FoleonHomepagePlacements` and stale tenant residue from prior failed provisioning.

## Files

| File | Purpose |
|---|---|
| `00-master-remediation-objective.md` | Full objective and non-negotiable constraints for a fresh ChatGPT/Codex session. |
| `01-wave-01-schema-remediation-prompt.md` | Fix source XML/schema definitions and de-risk list provisioning. |
| `02-wave-02-validation-and-package-proof-prompt.md` | Add schema validation, package proof, byte parity, and index-budget tests. |
| `03-wave-03-clean-site-repro-validation-prompt.md` | Validate remediated package on a clean SharePoint site. |
| `04-wave-04-tenant-cleanup-and-repair-prompt.md` | Address corrupted existing tenant lists safely. |
| `05-wave-05-controlled-provisioning-path-prompt.md` | Evaluate/implement longer-term PnP/Graph/backend provisioning path modeled after Safety Records. |
| `06-agent-plan-review-prompt.md` | Use when an agent returns a weak plan before execution. |
| `07-commit-summary-template.md` | Commit summary and description templates for final remediation. |

## Recommended Execution Order

1. Run `00-master-remediation-objective.md` in a fresh session to establish context.
2. Execute Wave 01.
3. Execute Wave 02.
4. Package and deploy only after Wave 02 passes.
5. Execute Wave 03 on a clean test site.
6. Execute Wave 04 only after evidence is captured from the broken site.
7. Execute Wave 05 if the team decides Feature Framework should not own complex business-list provisioning.

## Critical Closure Rule

Do not close this issue when the `.sppkg` builds.

Close it only when:

- source schema defects are fixed,
- package proof confirms repo/package parity,
- clean-site provisioning succeeds,
- all four lists open in SharePoint UI,
- REST fields/views/metadata calls succeed,
- the Foleon app can read/write the expected list contracts,
- tenant residue is either repaired or explicitly documented as a separate open item.
