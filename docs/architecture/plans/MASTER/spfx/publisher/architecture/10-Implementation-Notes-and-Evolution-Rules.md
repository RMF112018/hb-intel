# 10 — Implementation Notes and Evolution Rules

## 1. Schema evolution warning

This schema is intentionally detailed for MVP planning, but it is **not immutable**.

Fields connected to the following components may need to be revised after those components are updated or created:

- `hbSignatureHero`
- `teamViewer`
- any future branded article renderer replacing OOB body/media zones

## 2. Hero evolution notes

Expect possible changes in:
- metadata rendering controls
- focal point/crop hints
- theme/destination variants
- CTA behavior
- support for additional layout modes

Therefore:
- do not hard-code `hbSignatureHero` assumptions too deeply into unrelated systems
- prefer profile keys and version labels

## 3. TeamViewer evolution notes

Expect possible changes in:
- grouping model
- hierarchy model
- default display mode
- large-team handling
- featured-member behavior
- compact vs expanded rendering

Therefore:
- preserve flexible child-row metadata
- avoid prematurely locking org-chart semantics in MVP
- allow contract revision after the first validated UI pass

## 4. Template field evolution rule

Template-specific required fields may need to be updated following:
- hero enhancements
- teamViewer creation and validation
- page-shell composition changes
- the introduction of new shared article modules

The template registry and validation engine should be designed to support controlled evolution without breaking prior articles.

## 5. Implementation guidance

Recommended implementation order:

1. lock list schema
2. lock template registry
3. lock article/page binding model
4. lock initial hero contract
5. design and lock `teamViewer` MVP contract
6. implement validation engine
7. implement preview
8. implement page shell generation and publish flow

## 6. Change-management rule

Any update to:
- hero contract
- teamViewer contract
- template registry behavior
- page shell structure

should trigger review of:
- field definitions
- validation rules
- template mappings
- publishing/sync behavior

## 7. Documentation rule

As implementation proceeds, update:
- field definitions
- template registry docs
- renderer contracts
- validation rules

to keep this package authoritative and current.
