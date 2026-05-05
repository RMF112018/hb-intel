# 12 — Resolved Implementation Gap Register

## Purpose

This register converts the previously identified missing information into explicit implementation contracts.

## Gap Resolution Matrix

| Gap | Resolution in Package |
|---|---|
| MVP cut line | Defined in README, docs 01, and `phase17_authority.json` |
| Role/action/redaction matrix | Defined in docs 08 and `site_health_security_redaction_matrix.json` |
| Read-model route contract | Defined in docs 05 and `site_health_read_model_command_contract.json` |
| Data ownership/storage split | Defined in docs 05 and `sharepoint_index_strategy.json` |
| SharePoint list schema detail | Defined in docs 05, docs 10, and prompt 05 |
| Health lifecycle state machine | Defined in docs 03 and `repair_request_contract.json` |
| Desired versus observed comparison | Defined in docs 03 and `drift_classification_contract.json` |
| Evidence model | Defined in docs 02 and `site_health_registry_contract.json` |
| UX component contract | Defined in docs 06 and wireframe docs |
| Accessibility criteria | Defined in docs 06 and wireframes |
| Priority Actions rules | Defined in docs 04 and source integration matrix |
| Wave 14 handoff | Defined in docs 04 and `admin_verification_contract.json` |
| Wave 15 integration | Defined in docs 04 and source integration matrix |
| Wave 16 integration | Defined in docs 04 and settings health references |
| Audit boundary | Defined in docs 08 and audit taxonomy |
| Error taxonomy | Defined in docs 03 and validation gates |
| Test strategy | Defined in docs 09 and validation gates |
| Codex execution constraints | Defined in prompts and `agent_execution_rules.json` |

## Developer-Ready Decisions

- Use `Site Health` as the user-facing name.
- Use `site-health` as the surface and route family ID.
- Use `SiteHealth` as the TypeScript naming root.
- Treat Wave 17 as documentation authority only.
- Treat future implementation as read-model-first and GET-only.
- Persist health findings only after a later implementation package explicitly approves storage implementation.
- Treat repair request records as future-gated workflow records, not repairs.
- Use persona-aware redaction for permission and security findings.
- Do not expose secret values, tokens, or raw sensitive tenant configuration.
- Use SharePoint indexed and paginated queue design for any persisted list with operational growth.
