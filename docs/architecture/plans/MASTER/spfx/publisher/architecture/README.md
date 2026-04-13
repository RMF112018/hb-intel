# Project Spotlight Post Publishing Architecture Package

## Purpose

This package defines the full-detail product, content, and page-binding architecture for a **Project Spotlight post publishing solution** whose rendered output is a **new page created on**:

- `https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight`

The package assumes:

- the solution no longer targets a dual-destination article publisher model
- **Project Spotlight is the only publish destination**
- list records remain the authoritative editorial control plane
- the attached Project Spotlight XML artifact is the **canonical page-shell source** for generated destination pages
- generated pages are created from that shell and then populated with structured post data
- authors should not manually compose the SharePoint page canvas except in controlled admin exception scenarios

## Canonical page-shell authority

The attached XML artifact defines a canonical Project Spotlight shell whose current composition is:

1. **Banner / title region**
   - SharePoint OOB Page Title / banner control
   - full-width image layout
   - title + publish-date-capable header treatment

2. **Primary content section**
   - subheading text block
   - body text block
   - custom `teamViewer` slot

3. **Media section**
   - SharePoint OOB image gallery slot

That shell is the governing structural baseline for generated post pages. The architecture below therefore treats the XML artifact as the source of truth for:

- page section order
- block presence
- default block types
- base composition expectations
- shell versioning and regeneration rules

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

This package is intended to act as the implementation-planning authority for:

- Project Spotlight post list schema design
- XML-template-driven page-shell generation
- template/profile resolution
- renderer contract design
- validation logic
- workflow implementation
- controlled evolution of hero/team/gallery behavior

## Key principles

1. **Structured posts are authoritative**
   - post truth, workflow state, team/media relationships, and template-driving metadata live in lists

2. **Project Spotlight pages are render shells**
   - destination pages provide the durable SharePoint-hosted URLs
   - the page canvas is generated from the canonical XML shell rather than manually composed post-by-post

3. **The XML shell is first-class architectural input**
   - composition begins from the template shell, not from scattered code assumptions

4. **Templates are post-family-driven, not destination-driven**
   - template selection is based on Project Spotlight post family, project stage, spotlight type, article subject, and shell compatibility

5. **Custom webparts are renderers, not authoring widgets**
   - `teamViewer` consumes structured post data
   - `hbSignatureHero` is preserved as a future-compatible evolution path, but the current canonical shell uses the OOB Page Title / banner region

6. **Schema evolution is expected**
   - fields tied to banner/hero behavior, `teamViewer`, or future shell variants may need revision as implementation matures

## Intended next use

This package should be used to produce:

- implementation prompts
- list provisioning plans
- XML-shell generation logic
- page binding and republish logic
- shared renderer contract plans
- phased delivery plans
