# 00 — Plan Summary

## Objective

Create a centralized **HB Article Publisher** hosted on the `Marketing` site that allows marketing users to author and publish structured articles into:

- `CompanyPulse`
- `ProjectSpotlight`

Each destination uses destination-specific templates and branded page-shell compositions. The authoring workflow is centralized; rendered output is distributed to the correct destination site.

## Solution summary

### Authoring model
- One full-page publishing application
- Centralized editorial workflow
- Structured content entry
- Controlled previews
- Minimal or no raw SharePoint page editing by authors

### Authoritative control plane
- Article content and editorial state are stored in lists
- Template selection is driven by rules
- Promotion and featured logic are stored explicitly
- Child records support related team members and media

### Destination page model
- Pages are created/updated on the destination sites
- Pages act as branded render shells
- Pages resolve article data by durable `articleId`
- Pages use a controlled composition recipe

### Render components
- `hbSignatureHero`
- `teamViewer`
- OOB text web part
- OOB image web part
- OOB image gallery web part

## Major design decisions

1. **One publisher, two destinations**
2. **Lists as source of truth**
3. **Destination-specific templates**
4. **Custom hero and team modules as shared renderers**
5. **OOB text/image/gallery retained where useful**
6. **Template resolution by editorial rules**
7. **Promotion/feed rules kept in the control plane**
8. **Schema kept extensible for future component changes**

## MVP scope

### Included
- Article records
- Team-member child records
- Media child records
- Template registry
- Page binding model
- Hero rendering contract
- Team rendering contract
- Basic editorial workflow
- Publish / republish / archive support
- Featured and feed controls

### Deferred / likely Wave 2
- Advanced org-chart rendering in `teamViewer`
- More dynamic hero variations
- Rich multi-section article body structures
- Advanced analytics
- Broader destination expansion
- More complex campaign windows and automation

## Design warning

The system should **not** drift into:
- page canvas as source of truth
- raw webpart-property authoring by marketing
- template behavior hidden in scattered code
- schema rigidity that blocks hero/team evolution
