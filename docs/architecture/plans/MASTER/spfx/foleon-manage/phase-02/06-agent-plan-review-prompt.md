---
generated_utc: 2026-04-25T08:26:30Z
package: HB Intel Foleon SPFx list provisioning remediation
repo: RMF112018/hb-intel
target_package_version_observed: 1.0.11.0
uploaded_sppkg_sha256_observed: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
source_audit_basis: Foleon list provisioning audit package generated from current repo/package inspection
---


# 06 — Agent Plan Review Prompt

Use this prompt when a coding agent returns a plan that appears too shallow, too broad, or likely to miss the audit findings.

## Prompt

Revise your plan before execution.

Your current plan is not acceptable unless it directly closes the specific Foleon list provisioning failure identified in the audit.

The objective is not to make the package build.  
The objective is not to confirm that schema files are included in the `.sppkg`.  
The objective is not to make the webpart render.  
The objective is to stop SharePoint from creating corrupted/unloadable Foleon lists and to prove the result with source, package, and tenant evidence.

Your revised plan must address each of the following explicitly:

1. How you will reduce or otherwise remediate over-indexing in `HB_FoleonContentRegistry`.
2. How you will prove the indexed-field count is safe and remains safe.
3. How you will de-risk `HB_FoleonHomepagePlacements.ContentLookup`.
4. Whether `ContentLookup` will be removed from initial Feature Framework provisioning, made optional, or left required with evidence.
5. How you will verify the correct current SharePoint uniqueness-enforcement mechanism for:
   - `FoleonDocId`,
   - `EventId`,
   - `RunId`.
6. How you will align:
   - XML schema files,
   - `foleonListSchemas.ts`,
   - list-schema markdown docs,
   - service query assumptions.
7. How you will add schema validation that fails on:
   - duplicate field IDs,
   - unresolved view fields,
   - stale schema files,
   - unresolved `CustomSchema` references,
   - lookup target ordering defects,
   - index-budget violations.
8. How you will enhance `package:proof` to prove byte-for-byte repo/package parity for:
   - `elements.xml`,
   - all four schema XML files.
9. How you will prove the package has no stale schema files.
10. How you will validate a clean SharePoint site.
11. How you will distinguish clean-site package failure from corrupted-site tenant residue.
12. What tenant evidence is still required before declaring tenant closure.
13. What exact validation commands you will run.
14. What files you expect to change.
15. What you will not change.

Your revised plan must avoid:

- UI redesign,
- route changes,
- auth weakening,
- unrelated package changes,
- claiming success based only on build/package output,
- deleting tenant lists without backup/export.

Return a revised plan with:

- Objective,
- Findings Being Closed,
- Implementation Steps,
- Validation Steps,
- Tenant Evidence Required,
- Risks,
- Explicit Non-Changes,
- Commit Summary Draft.

Do not execute until this plan is strong enough to close the audit findings.
