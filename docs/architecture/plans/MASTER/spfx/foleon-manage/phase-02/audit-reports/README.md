# Foleon List Provisioning Audit Package

Generated UTC: 2026-04-25T08:22:25Z

Package under review: `hb-intel-foleon` 1.0.11.0  
Uploaded `.sppkg` SHA-256: `3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc`

Files:
- `01-foleon-list-provisioning-audit-report.md`
- `02-root-cause-evidence-matrix.md`
- `03-sharepoint-schema-defect-register.md`
- `04-remediation-plan.md`
- `05-local-agent-fix-prompt.md`
- `06-tenant-validation-runbook.md`
- `07-clean-site-repro-test-plan.md`
- `08-risk-and-rollback-plan.md`

Primary conclusion: the most likely root cause is schema-level provisioning failure, led by over-indexing in `HB_FoleonContentRegistry`, with tenant residue and same-feature lookup provisioning as secondary risks.

Web research was not performed because web search was unavailable in this ChatGPT session. A local agent must verify current Microsoft Learn guidance before implementation.
