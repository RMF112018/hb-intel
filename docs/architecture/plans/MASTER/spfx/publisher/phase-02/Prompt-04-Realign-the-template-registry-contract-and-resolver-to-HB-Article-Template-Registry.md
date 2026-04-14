# Prompt-04 — Realign the template registry contract and resolver to `HB Article Template Registry`

Use this in a fresh local code-agent session.

```text
You are working in the live local HB Intel repo.

Primary repo:
https://github.com/RMF112018/hb-intel.git

Objective:
Rebuild template typing, row mapping, resolution logic, and resolution context so preview and publish operate on the actual tenant template registry.

Critical operating instruction:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Mandatory authority:
- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md
- docs/architecture/plans/MASTER/spfx/publisher/architecture/publisher-rebranding-report.md
- /mnt/data/03-Findings-Register.md
- /mnt/data/04-Recommended-Remediation-Sequence.md

Working posture:
- This is a tightly bounded remediation task for one gap only.
- Do not redesign adjacent systems.
- Do not make unrelated refactors.
- Do not collapse this into a broader multi-gap rewrite.
- Preserve the Article Publisher rebrand.
- Preserve Project Spotlight as the current destination identity where the rebranding report explicitly says it remains valid.
- Treat the tenant list schema as the source of truth when code conflicts with prior assumptions.

Files to inspect first:
- `publisherContracts.ts`
- `publisherListDescriptors.ts`
- `publisherRowMappers.ts`
- `templateResolver.ts`
- `publishResolutionContext.ts`
- `validation/validationEngine.ts`
- tests

Required changes:
1. Replace the non-tenant template fields with the real registry fields, including `IsActive`, `VersionLabel`, `ContentTypes`, `Destination`, `PageShellTemplateKey`, the profile keys, and the show/hide toggles.
2. Rebuild resolver rules around the real tenant schema rather than the obsolete `TemplateStatus` / `TemplateVersion` / `RenderProfileKey` model.
3. Ensure the resolver remains deterministic and testable.
4. Update resolution-context assembly and dependent tests to use the new template model.
5. Do not change current Project Spotlight destination behavior unless the tenant schema requires it.

Implementation discipline:
- Scrub the full bounded seam for stale assumptions related to this gap.
- Update code, tests, and nearby comments only where required to close this gap cleanly.
- Keep behavior deterministic and testable.
- Where a prior abstraction is wrong for the tenant model, fix the abstraction rather than layering a fragile compatibility patch on top.
- Do not move on to any later remediation category until this one is fully closed.

Verification required:
- Run targeted tests for the changed seam.
- Run `pnpm --filter @hbc/spfx-hb-webparts check-types`.
- Add or update tests so this exact drift cannot silently regress.
- In your final report, explicitly prove the following exit criteria are satisfied:
- Template resolution uses only tenant-authored registry fields.
- Preview/publish resolution context is tenant-aligned.
- Resolver tests cover the new matching and active/inactive behavior.

Required final deliverables in your response:
1. Concise summary of exactly what changed
2. File-by-file change list
3. Verification performed and results
4. Any residual risks that are truly out of scope for this prompt
```
