# Tool Launcher Internal-Name Remediation Prompt Package

## Objective
Update the Tool Launcher SharePoint list adapter/query so the live `Tool Launcher Contents` list is queried with the **actual internal field names** from the updated SharePoint export, then perform a **full clean rebuild** of `hb-webparts` and replace the existing `hb-webparts.sppkg` artifact.

## Package Contents
1. `Prompt-01-Tool-Launcher-Internal-Name-Remediation.md`
2. `Prompt-02-HB-Webparts-Clean-Rebuild-and-Package-Replacement.md`
3. `Phase-Remediation-Summary-Tool-Launcher-Internal-Names.md`

## Recommended Execution Order
1. Execute Prompt 01.
2. Review the code diff and confirm the Tool Launcher list source is now using the live internal names.
3. Execute Prompt 02.
4. Validate the rebuilt `hb-webparts.sppkg` and replace the prior artifact.

## Scope Boundary
This package is intentionally narrow.

In scope:
- `apps/hb-webparts/src/homepage/data/toolLauncherListSource.ts`
- any adjacent Tool Launcher adapter/types files that must be touched to keep the adapter/query seam correct and type-safe
- clean rebuild of the `hb-webparts` domain package
- replacement of the existing `hb-webparts.sppkg`

Out of scope unless required to complete the narrow fix:
- visual redesign
- Tool Launcher presentation composition
- non-Tool-Launcher webparts
- unrelated SharePoint lists
- speculative refactors

## Key Constraints
- Repo truth is authoritative.
- Do not re-read files that are already in the agent's current context or memory unless needed to resolve uncertainty.
- Preserve the current Tool Launcher domain model and presentation behavior.
- Do not change manifest IDs.
- Do not broaden the fix into a list-schema redesign.
- Do not leave temporary debug logging in shipped code.

## Expected Outcome
After execution:
- the Tool Launcher REST query uses the live SharePoint internal names from the updated export
- the query no longer 400s due to field-name mismatch
- `hb-webparts.sppkg` is rebuilt from a clean state using the repo's authoritative packaging flow
- the old package artifact is replaced with the clean rebuilt artifact
