# 00 — Plan Summary

## Objective

Create a **Project Spotlight post publishing architecture** that stores structured post records in the editorial control plane and publishes each approved post as a **new page** on:

- `https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight`

The page must be generated from the canonical **Project Spotlight - In Progress** XML template artifact, which now serves as the governing page-shell source.

## Solution summary

### Authoring model
- one full-page post publishing application
- structured post entry instead of raw page editing
- preview driven by resolved template + page shell
- publish/republish workflow tied to explicit page bindings

### Authoritative control plane
- post content and workflow state are stored in lists
- project metadata, spotlight type, and subject drive template resolution
- child rows support related team members and gallery media
- template registry defines shell compatibility, block visibility, and validation

### Destination page model
- every published post creates or updates a bound page on `ProjectSpotlight`
- the bound page is generated from the canonical XML shell
- the page is a render shell, not the source of editorial truth
- article/post-to-page linkage is durable and version-tracked

### Current shell-derived render components
- **OOB Page Title / banner** for the hero/banner region
- **OOB Text** for subheading
- **OOB Text** for body
- **`teamViewer`** for the team section
- **OOB Image Gallery** for the gallery section

### Future-compatible renderer path
- `hbSignatureHero` remains an intentional evolution path
- it is **not** the active banner renderer in the current canonical XML shell
- the template registry should allow future shell variants that replace the OOB banner with `hbSignatureHero`

## Major design decisions

1. **One publisher, one destination**
2. **Project Spotlight XML shell is canonical**
3. **Lists remain the source of truth**
4. **Template resolution is based on post family + stage + subject, not destination branching**
5. **Page binding is explicit and durable**
6. **The current shell uses OOB banner/text/gallery plus `teamViewer`**
7. **OOB secondary-image behavior is removed from the base shell unless a future shell variant adds it**
8. **Schema remains extensible for later `hbSignatureHero` adoption and Team Viewer maturation**

## MVP scope

### Included
- Project Spotlight post master records
- team-member child records
- gallery/media child records
- Project Spotlight template registry
- Project Spotlight page-binding model
- OOB banner/text/gallery mapping
- `teamViewer` mapping
- preview / publish / republish / archive support
- shell version and template version tracking

### Deferred / likely Wave 2
- alternate XML-compatible shell families
- `hbSignatureHero` as an active banner replacement
- richer structured body blocks beyond a single primary body field
- smarter gallery variants
- analytics and engagement instrumentation
- advanced rollup and campaign-window automation

## Design warning

The system should **not** drift into:

- manual page-canvas editing as the normal authoring workflow
- hidden page composition logic scattered across code paths
- leftover Company Pulse / dual-destination assumptions
- secondary-image requirements that are not actually represented in the canonical XML shell
- silent shell regeneration without explicit version tracking
