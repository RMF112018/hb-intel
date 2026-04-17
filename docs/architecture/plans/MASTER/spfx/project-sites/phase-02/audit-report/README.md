# Project Sites Performance & Stability Audit Package

This package contains a repo-truth audit of the current `main` branch Project Sites implementation, focused on rendering stability, runtime durability, and SharePoint host-fit behavior.

## Included Files
- `00-Performance-and-Stability-Audit-Summary.md`
- `01-Current-Runtime-Architecture-Map.md`
- `02-Render-Stability-and-Performance-Assessment.md`
- `03-Hosted-Symptom-and-Root-Cause-Hypotheses.md`
- `04-Findings-Register.md`
- `05-Recommended-Remediation-Sequence.md`

## Bottom Line
The primary issue is not generic React slowness. It is a combination of:
- unstable layout-state derivation,
- forced remount behavior,
- and a non-idempotent shell mount seam.

The remediation prompt package is designed to close those issues in the correct order.
