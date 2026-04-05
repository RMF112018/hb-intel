# Phase 05 Standards and Best Practices — Navigation Governance and Branding Rules

## Governing posture

Phase 05 operates inside the already-established three-lane SharePoint model:

- **Lane A:** Homepage / Page-Canvas Product
- **Lane B:** Shell Extension Product
- **Lane C:** Navigation & Governance

Phase 05 is specifically about Lane C.

## Best-practice rules

### 1. Prefer native SharePoint governance where native capability is sufficient
Use supported home-site, hub, and global navigation controls for navigation governance before proposing custom code.

### 2. Keep navigation single-purpose
Global nav should solve tenant/site wayfinding.
Homepage utilities should solve high-value tasks and entry actions.
Shell placeholder links should solve lightweight shell-adjacent needs.
These are not interchangeable.

### 3. Avoid redundant paths without a justified reason
A destination may appear in more than one place only when the reason is explicit:
- primary enterprise wayfinding
- urgent task access
- contextual support/help

### 4. Treat branding as a governed system, not decoration
Native branding, homepage design, and shell placeholders must feel coherent, but each must stay in its supported role.

### 5. Limit template families
Use a small number of clearly named page-template families instead of many bespoke page types.

### 6. Make ownership visible
Every nav area, page template, and governance rule should have an owner and an approval path.

### 7. Escalate exceptions
Any request that:
- duplicates shell behavior
- bypasses supported SharePoint posture
- weakens Lane A / Lane B boundaries
- creates a new page pattern without precedent

must route through architecture/product review.

## Definition of success

Phase 05 succeeds when:
- site owners know what they can configure directly
- admins know what should stay native
- product/architecture knows when a request belongs in Lane A, Lane B, or Lane C
- the tenant can scale without losing the quality established in Phases 01–04
