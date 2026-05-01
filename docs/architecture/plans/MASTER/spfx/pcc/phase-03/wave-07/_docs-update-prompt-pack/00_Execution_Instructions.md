# 00 — Execution Instructions

You are a local code agent working in the live repository:

```bash
/Users/bobbyfetting/hb-intel
```

## Objective

Audit the existing **Project Control Center Phase 3 / Wave 7** planning, blueprint, and roadmap documentation and update all Wave 7 references to align with the updated target architecture for **HB Document Control Center**.

Use the standalone architecture reference in:

```text
02_Target_Architecture_Reference_HB_Document_Control_Center.md
```

as the controlling content source for the documentation update.

## Critical instruction

Do **not** assume the current documentation is already correct. Perform a repo-truth audit first, then update the relevant documentation with the minimum necessary changes to bring Phase 3 / Wave 7 into alignment.

## Required final result

A documentation-only commit-ready change set that:

1. Confirms **Phase 3 / Wave 7** remains the document-control wave.
2. Updates the Wave 7 target to **HB Document Control Center**.
3. Incorporates the updated three-lane architecture:
   - Project Record
   - My Project Files
   - External Systems
4. Adds the Project Document Source Registry / binding model.
5. Adds the `My Project Files` OneDrive model and hard guardrail.
6. Adds `Procore Project ID` to the target metadata discussion.
7. Adds the expanded review types:
   - PM Review
   - PX Review
   - Operations Review
   - Accounting / Admin Review
   - Lead Estimator Review
   - Chief Estimator Review
   - Legal Review
   - Compliance Review
   - Leadership Review
   - Custom Internal Review
8. Adds the complete permission model by action using the role/action matrix from the architecture reference.
9. Replaces any use of **Project Engineer** in this Wave 7 context with **Project Coordinator**.
10. Keeps external systems as linked systems of record unless later phases approve deeper integration.
11. Preserves Wave 7 safety boundaries:
   - no direct SPFx broad Graph execution;
   - no external writeback;
   - no file mirroring;
   - no tenant mutation;
   - no deployment/package changes;
   - no default live Graph calls.

## Scope

### Allowed

- Markdown documentation updates under PCC architecture/planning docs.
- New Wave 7 planning docs if the repo pattern supports them.
- Cross-reference updates in roadmap/blueprint docs.
- Documentation-only closeout/audit notes.

### Forbidden unless explicitly authorized by the user

- Application source changes.
- Backend source changes.
- Package or lockfile changes.
- SPFx manifest changes.
- `.sppkg` packaging.
- Deployment/workflow changes.
- Azure, Microsoft 365, SharePoint, Graph, Procore, Adobe Sign, or Document Crunch live operations.
- Tenant mutation.
- Permission mutation.
- Procore/Document Crunch/Adobe Sign writeback.
- Direct SPFx Graph file execution.
- Re-sequencing Wave 7 to Responsibility Matrix.

## Agent conduct

- Do not re-read files that are still within your current context or memory.
- Keep edits narrow and evidence-based.
- Preserve existing repo language and formatting where possible.
- Prefer updating canonical docs instead of duplicating conflicting definitions.
- If contradictions are discovered, document them and resolve in favor of the Phase 3 Wave 7 target defined in the architecture reference unless the contradiction is outside scope.
