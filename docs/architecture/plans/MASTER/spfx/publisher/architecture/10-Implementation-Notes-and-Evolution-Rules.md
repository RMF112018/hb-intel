# 10 — Implementation Notes and Evolution Rules

## 1. Schema evolution warning

This schema is intentionally detailed for MVP planning, but it is **not immutable**.

Fields connected to the following areas may need revision after implementation is validated:

- Project Spotlight banner/hero behavior
- `teamViewer`
- OOB gallery behavior
- future shell-family expansion

## 2. XML shell authority note

The attached Project Spotlight XML artifact is not a throwaway reference.

Treat it as:

- the current canonical page-shell source
- the baseline composition artifact for generated pages
- an authority for which blocks currently exist
- an authority for shell-version tracking

Any change to that source shell should trigger review of:

- template registry rows
- control-map JSON
- validation rules
- page-generation logic
- page-regeneration rules

## 3. Banner / hero evolution notes

The current shell uses the SharePoint OOB Page Title / banner block.

Expect future changes in:

- whether the banner remains OOB
- whether `hbSignatureHero` replaces it
- metadata rendering
- crop/focal-point handling
- theme variants
- richer project metadata display

Therefore:

- do not hard-code banner assumptions too deeply
- prefer `HeroRendererKind` / `BannerRendererKind` + profile keys
- tie banner requirements to shell compatibility

## 4. Team Viewer evolution notes

Expect possible changes in:

- grouping model
- hierarchy model
- large-team handling
- list vs grid modes
- profile-detail drawer behavior
- featured-member emphasis

Therefore:

- preserve flexible child-row metadata
- avoid prematurely locking hierarchy semantics in MVP
- allow contract revision after the first validated UI pass

## 5. Gallery / media evolution notes

The current shell contains a gallery slot but **not** a standalone secondary-image slot.

Therefore:

- keep media modeling focused on gallery rows in MVP
- do not preserve hidden secondary-image assumptions in validation
- introduce any future image-slot behavior through a new shell key, not a silent schema drift

## 6. Template field evolution rule

Template-specific required fields may need to be updated following:

- shell changes
- banner renderer changes
- Team Viewer validation updates
- introduction of new Project Spotlight shell families
- introduction of structured multi-section body rendering

The template registry and validation engine should support controlled evolution without breaking older posts.

## 7. Recommended implementation order

1. lock list schema
2. lock template registry
3. lock page-binding schema
4. lock shell control-map contract
5. lock Team Viewer MVP contract
6. implement template-aware validation
7. implement preview
8. implement page generation from the Project Spotlight shell
9. implement republish and regeneration logic
10. implement archive/withdraw behavior

## 8. Change-management rule

Any update to:

- the XML shell source
- banner renderer choice
- Team Viewer contract
- template registry behavior
- shell control-map JSON

should trigger review of:

- field definitions
- validation rules
- template mappings
- publish / republish / regenerate logic
- workflow documentation

## 9. Documentation rule

As implementation proceeds, update:

- field definitions
- template registry docs
- binding docs
- renderer contracts
- validation rules

so this package remains authoritative and aligned with the actual Project Spotlight implementation.
