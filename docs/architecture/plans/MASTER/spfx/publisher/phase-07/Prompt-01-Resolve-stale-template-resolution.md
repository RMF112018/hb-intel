# Prompt 01 — Resolve stale template resolution behavior

## Objective

Close the defect where an article's `TemplateKey` becomes sticky after the first save and can survive later discriminator changes (`Destination`, `ArticleContentType`, `SpotlightType`, `ProjectStage`, `ArticleSubject`) even when the current template no longer matches the article.

## Governing authority / required references

Treat the following as binding:
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/templateResolver.ts`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/publishResolutionContext.ts`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`

## Files and code paths to inspect

At minimum inspect:
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - `handleSave`
  - metadata-panel field changes for:
    - `Destination`
    - `ArticleContentType`
    - `SpotlightType`
    - `ProjectStage`
    - `ArticleSubject`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/templateResolver.ts`
  - `resolveTemplate`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishResolutionContext.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- any tests covering template resolution or article-save behavior

## Exact defect to close

Current behavior:
- a new article starts with blank `TemplateKey`
- first save resolves and stamps a real `TemplateKey`
- later saves only re-resolve when `TemplateKey` is blank
- `resolveTemplate(...)` treats any non-empty `TemplateKey` as an override and bypasses destination/content-type/applicability filters except `IsActive`
- the authoring UI does not expose a true template override control or a reset path

This means ordinary author edits can leave the article bound to a stale template without a safe way to recover.

## Required implementation outcome

Implement a product-grade template lifecycle for ordinary author edits.

Acceptable closure options:
1. **Preferred** — treat `TemplateKey` as system-managed for ordinary authoring and automatically re-resolve it whenever any template-driving discriminator changes, unless a true explicit admin override flag/control exists.
2. **Alternative** — introduce a deliberate template-override model with:
   - explicit operator intent
   - visible current-template state
   - reset / re-resolve path
   - validation that distinguishes override vs ordinary resolution

Minimum closure requirements:
- ordinary metadata changes must not silently preserve an incompatible template
- preview / publish / republish must see the same corrected template outcome
- validation must surface a blocking error or automatic correction when the current template no longer matches the article
- do not invent schema fields not present on the tenant lists

## Validation / proof of closure requirements

Prove all of the following:
- changing a template-driving discriminator on an existing saved article results in a correct re-resolution or a deliberate blocking state
- preview and publish now agree on the selected template
- there is no path where a stale non-empty `TemplateKey` silently bypasses applicability during ordinary authoring
- any tests added or updated are specific to this seam

## Deliverables / closure docs

Create:
- a closure note at:
  - `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/closure/closure-template-lifecycle.md`

The closure note must include:
- exact files changed
- previous behavior
- final behavior
- why the final behavior is safe
- proof steps performed

## Explicit instruction not to make unrelated changes

Do not broaden destination support, do not implement milestone content, do not rework promotion rules, and do not touch scheduled workflow behavior in this prompt.

## Operating instruction

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
