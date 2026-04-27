# 13 — Risk Register and Guardrails

## Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Backend architecture accidentally redesigned | High | Prompts prohibit backend redesign and new routes unless repo truth proves necessity. |
| Split readiness collapsed into one boolean | High | Acceptance criteria require all readiness boundaries remain visible. |
| Marketing workflow still buried under config | High | Default tab must be Homepage Foleon Content. |
| Raw secrets/URLs/GUIDs exposed | High | Primary UI must use friendly states/fingerprints; diagnostics redacted. |
| Consent missing treated as fatal | High | Limited/read-only mode required where safe. |
| Existing workflows broken | High | Tests must prove edit/validate/publish/suppress/placement/sync remain reachable. |
| Diagnostic proof hidden too deeply for admins | Medium | Config includes a diagnostics disclosure and copy proof action. |
| Visual polish destabilizes source | Medium | Controlled waves; minimal surface changes per prompt. |
| SharePoint page width overflow | Medium | Responsive acceptance criteria and screenshot proof required. |
| Version/package drift | Medium | Version changes only in source-changing implementation wave; package proof in final wave. |
| Local agent re-reads too much or drifts | Medium | Prompts specify exact files and no re-read rule. |

## Guardrails

## Non-Negotiable Architecture Guardrails

- Preserve the registry-first architecture.
- Preserve split readiness states; do not collapse readiness into one boolean.
- Preserve degraded consent-required rendering.
- Preserve backend route boundaries; do not add routes unless repo truth proves they are required.
- Preserve redacted diagnostics; never surface raw secrets, tokens, backend URLs, API resources, or list GUIDs in the primary UI.
- Preserve existing content workflows: save, validate, publish, suppress, placement, sync.
- Do not change package/version files as part of the audit/planning package.
- If shipped SPFx behavior changes in implementation, versioning must be handled only in the relevant implementation wave and documented in closure.
- Do not re-read files that remain in active local-agent context unless needed to verify drift, contradictions, or line-level implementation details.


## Implementation Boundary

This package is not a code implementation. It is a remediation and prompt package.

The local code agent must:

- inspect current repo truth;
- identify exact implementation seams;
- apply only the wave-specific changes;
- run targeted tests;
- provide closure report;
- commit only wave-specific files.

## Security Posture

Primary UI must never expose:

- tokens;
- secrets;
- raw backend URLs;
- raw API resource identifiers;
- raw list GUIDs;
- unredacted runtime proof;
- stack traces.

Diagnostics must be redacted and copyable.

## UX Posture

The product must be useful in degraded mode.

- Missing API approval should not make the app look broken.
- Read-only content review should remain available when safe.
- Blocked write/sync actions must state why.
- Technical proof must be available but not visually dominant.
