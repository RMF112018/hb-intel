# HB Article Publisher — Product + Data Architecture Package

## Purpose

This package defines the full-detail product and content model for a centralized **HB Article Publisher** hosted on the `Marketing` site and publishing branded article pages into:

- `CompanyPulse`
- `ProjectSpotlight`

The package assumes:

- list records are the authoritative editorial control plane
- destination pages are branded render shells
- page shell composition is destination-specific and template-driven
- `hbSignatureHero` and `teamViewer` are shared rendering components whose contracts may evolve
- authors should not directly modify SharePoint page layouts except in controlled admin exception cases

## Package contents

- `00-Plan-Summary.md`
- `01-Full-Detail-Product-and-Content-Model.md`
- `02-List-By-List-Architecture.md`
- `03-Exact-Field-Definitions.md`
- `04-Child-Record-Relationships.md`
- `05-Template-Registry-Schema.md`
- `06-Article-Page-Binding-Schema.md`
- `07-Webpart-Input-Contracts.md`
- `08-Validation-Rules-by-Template.md`
- `09-Editorial-Workflow-and-Lifecycle.md`
- `10-Implementation-Notes-and-Evolution-Rules.md`

## Governing posture

This package is intended to act as a product/data authority for implementation planning. It is intentionally detailed enough to support:

- list schema design
- page shell generation
- template resolution
- rendering contract design
- validation logic
- workflow implementation
- future schema evolution

## Key principles

1. **Lists are authoritative**
   - article truth, promotion state, team/media relationships, and template-driving metadata live in lists

2. **Pages are render shells**
   - destination pages provide branded SharePoint-hosted URLs and surface composition
   - pages should not become the primary source of article truth

3. **Templates are rule-driven**
   - authors provide content and editorial intent
   - the system selects the correct template and page composition profile

4. **Custom webparts are renderers, not authoring widgets**
   - `hbSignatureHero` and `teamViewer` consume structured article data
   - authors should not manually configure those webparts

5. **Schema evolution is expected**
   - fields tied to `hbSignatureHero`, `teamViewer`, or future branded components may need revision as those components mature

## Intended next use

This package should be used to produce:

- implementation prompts
- list provisioning plans
- page shell composition plans
- shared component contract plans
- phased delivery plans
