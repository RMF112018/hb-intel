# 00 — Audit Summary

## Executive summary
The Article Publisher app is **not correctly wired overall** to the actual SharePoint list architecture.

The repo contains a real Article Publisher authoring surface, a manifest, a runtime contract, a mount path, repositories, row mappers, validation logic, a state machine, preview logic, and publish orchestration. However, those layers are built against a **different list set and field model** than the actual tenant schema.

The code is built around these conceptual lists:
- `Project Spotlight Posts`
- `Project Spotlight Post Team Members`
- `Project Spotlight Post Media`
- `Project Spotlight Template Registry`
- `Project Spotlight Page Bindings`
- `Project Spotlight Workflow History`
- `Project Spotlight Publishing Errors`

The tenant actually exposes:
- `HB Articles`
- `HB Article Team Members`
- `HB Article Media`
- `HB Article Template Registry`
- `HB Article Destination Pages`
- `HB Article Workflow History`
- `HB Article Publishing Errors`
- `HB Article Promotion Rules`

This is not a minor naming drift. The current code also expects different field names, different enum values, different parent/child keys, and a different template / publish / page-binding model.


## Rebranding alignment note
This package has been updated to reflect the completed app rebrand from **Project Spotlight Publisher** to **Article Publisher**. The rebranding report states that no functional, architectural, workflow, destination, schema, validation, or UX changes were made. The findings below therefore remain substantively the same, but app-identity references have been updated to the new `articlePublisher/ArticlePublisher.tsx` surface and related manifest/runtime names. Destination-specific references to **Project Spotlight** remain intentional because the current shipped destination and related publish logic are still Project Spotlight-specific.

## Overall verdict
- **List wiring:** incorrect
- **Repository/service bindings:** incorrect
- **Field wiring:** incorrect
- **Parent/child relationships:** incorrect
- **Workflow logic:** not trustworthy against tenant schema
- **Publish / republish / preview model:** partially implemented in repo, but not operationally aligned to the tenant
- **Production readiness:** not production-ready

## Biggest risks
1. **Core list resolution fails at runtime.**  
   The repository layer reads and writes by list title. The configured list titles do not match the tenant list titles.

2. **Even if list titles were corrected, the field model is still wrong.**  
   The code expects `PostId`, `PostFamily`, `PageShellKey`, `TargetSiteKey`, `SourceTemplatePath`, `ImageAssetUrl`, `TemplateStatus`, `TemplateVersion`, `ValidationProfileKey`, `RenderProfileKey`, and other fields that do not match the actual schema.

3. **Workflow state values are mismatched.**  
   The code uses `inReview`; the tenant workflow schema uses `review`.

4. **Workflow history is structurally mismatched.**  
   The code writes `FromState`, `ToState`, `Action`, `Note`; the tenant schema uses `PreviousState`, `NewState`, and `ActionNote`, with no `Action` field.

5. **Promotion rules are unwired.**  
   The tenant has `HB Article Promotion Rules`, but the current Publisher adapter does not read it or write it.

6. **Publishing-error capture is incomplete.**  
   The repository interface includes publishing errors, but append/write is intentionally unimplemented.

7. **Publish path does not fully implement tenant-aligned side effects.**  
   The orchestrator composes pages and writes bindings, but does not implement the full article-master update / history / error / archive / withdraw / promotion behavior required by the tenant schema.

## Audit method
### Repo scope inspected
- Shell / mount entry point
- Web part manifest and runtime contract
- Authoring component
- Publisher adapter barrel
- enums
- contracts
- list descriptors
- row mappers
- repositories
- writers
- state machine
- template resolver
- resolution-context builder
- validation engine
- preview / page compositor / page shell / page creation / publish orchestrator
- adjacent Team Viewer bindings where they intersect publisher outputs

### Schema authority used
The uploaded `publisher-list-schema-report.md` was treated as the tenant-backed schema authority.

### Assumptions
- Repo `main` is the implementation authority.
- Uploaded schema report accurately reflects the live tenant list structure.
- Hosted behavior implications are inferred from the current repo implementation and the actual tenant schema.

### Limitations
- This was a repo-truth and schema-crosswalk audit, not a live browser execution session inside the hosted SharePoint page.
- No live tenant mutation testing was performed.
- The tenant lists were empty at extraction time, so the audit focuses on structural correctness rather than content-driven edge cases.

## Production readiness opinion
Do not treat the current Article Publisher implementation as ready for production publishing.  
The correct next step is not incremental polishing. It is **schema and repository realignment first**, then workflow/history/error alignment, then publish pipeline hardening, then hosted verification.
