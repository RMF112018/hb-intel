# 03 — Implementation Deliverables and Definition of Done

## Mandatory deliverables

### Delivery artifacts
- repo-truth findings note
- implementation tracker
- list provisioning scripts or script updates
- typed domain contracts
- service/repository layer
- XML-shell page-generation logic
- content-mapping layer
- page-binding logic
- authoring UI
- validation and preview
- Team Viewer integration closure
- automated test evidence
- hosted verification checklist with results
- final build/package proof

## Definition of done by topic

### A. List architecture
Done when:
- required lists exist or are fully provisionable
- field definitions align with architecture docs
- relationships are durable and typed

### B. Service layer
Done when:
- UI is not directly orchestrating raw list payloads
- template resolution and binding writes are encapsulated

### C. XML-shell generation
Done when:
- a Project Spotlight page can be generated from the saved XML shell
- shell version is tracked
- the shell is not being bypassed by scattered page composition logic

### D. Content mapping
Done when:
- banner, subhead, body, Team Viewer, and gallery all map from structured data
- optional block behavior is explicit

### E. Page binding
Done when:
- publish creates or updates a durable binding
- republish preserves page identity unless an approved regeneration path is triggered
- version lineage is recorded

### F. UI and workflow
Done when:
- posts can be authored, reviewed, published, and republished from structured UI surfaces
- destination page editing is not required in ordinary workflows

### G. Validation and preview
Done when:
- preview is driven by the same resolution pipeline used by publish
- template-aware field requirements are enforced before publish

### H. Testing and hosted vetting
Done when:
- automated tests cover the main publish path and key failure modes
- a hosted validation proves the page is created correctly on Project Spotlight

## Closure rule

Do not state that the implementation is complete unless the hosted proof confirms:
- correct destination site
- correct shell blocks
- correct mapped content
- correct page-binding write/update behavior
- correct republish behavior
