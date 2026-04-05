# SharePoint Branding and Page Template Rules

Canonical branding alignment, page-template families, composition patterns, and authoring rules for HB Central.

## Branding Alignment

### Who owns what

| Visual Element | Owner | Mechanism |
|---------------|-------|-----------|
| Site logo | Site Owner (approved by Corporate Comms) | SharePoint site settings |
| Site header layout | Site Owner | SharePoint site settings (Standard, Compact, Minimal, Extended) |
| Theme colors | Site Owner (approved by Brand) | SharePoint theme gallery / custom theme |
| Global nav appearance | Platform (SharePoint) | Not customizable beyond theme colors |
| Suite bar | Microsoft | Not customizable |
| Homepage page-canvas content | Lane A (`apps/hb-webparts`) | 10 homepage webparts via SPFx |
| Shell placeholder surfaces | Lane B (`apps/hb-shell-extension`) | Top ribbon, alert band, footer rail via SPFx Application Customizer |
| Page section layouts | Page Author | SharePoint page editor (1-column, 2-column, 3-column, etc.) |
| Web part content | Page Author / Webpart Owner | SharePoint page editor + property panes |

### Branding principles

1. **Platform-first:** Use native SharePoint branding (theme, logo, header layout) as the foundation. Do not recreate branding through custom code.
2. **Consistent tone:** HB Central should feel premium and established. Use the HB brand palette (`#225391` primary blue, `#E57E46` secondary orange) through the SharePoint theme system.
3. **No unsupported overrides:** Do not use CSS injection, DOM manipulation, or script injection to alter SharePoint's native chrome, header, or navigation appearance.
4. **Lane A is homepage-only:** The homepage webparts are designed for the HB Central homepage page canvas. They should not be scattered across arbitrary pages without architecture review.
5. **Lane B is tenant-wide:** Shell-extension placeholders render on all pages where the App Catalog deploys them. They should not be page-specific.

### Prohibited branding actions

- Custom CSS/JS that overrides SharePoint theme tokens
- Fake suite bar or app bar via HTML/CSS injection
- Site header backgrounds using unsupported injection patterns
- Removal or hiding of native SharePoint UI elements
- Inline styles on SharePoint page containers via script editors

---

## Page Template Families

### Template matrix

| Template Family | Purpose | Composition | Lane A Webparts? | Lane B Present? | Owner | Approval |
|----------------|---------|-------------|:----------------:|:---------------:|-------|----------|
| **Homepage** | HB Central landing experience | 5-zone webpart composition | Yes — all 10 webparts | Yes | Product / Architecture | Architecture |
| **Communications** | Company updates, leadership messages, culture | Native sections + text/image/hero web parts | No (use native) | Yes | Corporate Communications | Comms Lead |
| **Utility / Landing** | Department or function landing pages | Native sections + links/quick links/hero | No (use native) | Yes | Department Owner | Nav Owner |
| **Operational / Update** | Project updates, safety reports, status pages | Native sections + text/image/file viewer | No (use native) | Yes | Operations / Safety | Department Lead |
| **Simple Content** | Policies, procedures, knowledge articles | Single-column native text + headings | No | Yes | Content Author | Content Owner |

### Template governance rules

1. **Homepage is singular.** There is one HB Central homepage. It uses Lane A webparts in the governed 5-zone composition. No other page may use the homepage webpart package without architecture approval.
2. **Communications pages use native SharePoint.** The SharePoint modern page editor with hero, text, image, and file viewer web parts is sufficient for editorial content. Do not introduce custom webparts for communications pages.
3. **Landing pages are gateways.** They should use quick links, hero, and text sections to route users — not replicate dashboard or operational content.
4. **Operational pages are functional.** They report status, updates, or procedures. Keep them structured and scannable.
5. **Simple content pages are minimal.** Policies and knowledge articles should be clean, readable, single-column content.

---

## Approved Composition Patterns

### When to use Lane A webparts

| Scenario | Use Lane A? | Why |
|----------|:-----------:|-----|
| HB Central homepage | Yes | This is Lane A's purpose |
| Department landing page | No | Use native quick links / hero |
| Project status page | No | Use native text / image / file viewer |
| Company-wide communications | No | Use native hero / text / image |
| Safety procedures page | No | Use native content |
| New "premium" page concept | Maybe | Requires architecture review |

### When to use native SharePoint only

Most pages should use native SharePoint components:
- **Hero web part** — page-level hero (not the Lane A HB Hero Banner webpart)
- **Text web part** — body content, headings, lists
- **Image web part** — inline images
- **Quick Links web part** — navigation tiles
- **File viewer web part** — embedded documents
- **Highlighted content web part** — dynamic content rolls

### When architecture review is required

- Proposing Lane A webparts on a non-homepage page
- Creating a new page pattern not covered by existing template families
- Requesting custom web parts for a page type
- Building a page that competes with or duplicates an existing Lane A/B surface

---

## Authoring and Content Rules

### Page titles and heroes

- Every page must have a clear, descriptive title (not "Untitled" or "New Page")
- Homepage hero is owned by Lane A (HB Hero Banner webpart) — do not add a native hero web part on top of it
- Non-homepage pages should use the native hero web part for page-level branding
- Hero images should be high-quality, appropriately licensed, and have alt text

### Section rhythm and density

- Use 1-column layout by default for readability
- Use 2-column layout only when presenting parallel content (e.g., contact info + map)
- Avoid 3-column layouts on content-heavy pages — they create cramped reading on standard monitors
- Leave breathing room between sections — do not stack every available web part on a single page
- Max recommended web parts per page: 8 (excluding the hero)

### CTA and link hygiene

- Every CTA should have a clear action label ("View report", "Open form") — not "Click here"
- Links must point to live, accessible destinations
- External links should be explicitly labeled as external
- Stale links should be reported through the content review process

### Media rules

- Images must have descriptive alt text
- Avoid purely decorative images that add no information value
- Video embeds should include captions or transcripts for accessibility
- File attachments should use the file viewer web part, not inline download links

---

## Template Governance

### Page creation approval

| Page Type | Self-Service? | Approval Required? |
|-----------|:------------:|:-----------------:|
| Simple content page | Yes | No (follows template) |
| Communications page | Yes (Comms team) | Comms Lead review |
| Department landing page | No | Department Lead + Nav Owner |
| Operational update page | Yes (Ops team) | Department Lead review |
| Homepage changes | No | Architecture + Product |
| New template family | No | Architecture review required |

### Template change governance

- Template families are defined in this document and require architecture review to modify
- Adding a new template family requires a justification for why existing families are insufficient
- Changing the homepage composition (adding/removing/reordering Lane A webparts) requires product + architecture approval

### Drift cleanup

Pages that drift from their template standards should be:
1. **Identified** during quarterly content review
2. **Flagged** to the page owner with the specific standard violated
3. **Remediated** within 30 days or escalated to the content governance lead
4. **Archived** if the page is stale, redundant, or no longer maintained

---

## Related Documents

- [Navigation Governance](./sharepoint-navigation-governance.md) — Lane C nav ownership and change-control
- [Navigation Taxonomy](./sharepoint-nav-taxonomy.md) — global nav structure and anti-sprawl rules
- [Homepage & Shell Boundaries](./sharepoint-homepage-shell-boundaries.md) — three-lane architecture
- [SPFx Homepage Overlay](./ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md) — Lane A visual doctrine
