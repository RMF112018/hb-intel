# HB Central Leadership Message Foleon Reader Rescue

**Date:** 2026-04-27  
**Scope:** Repo-truth audit, screenshot-hosted UI/UX assessment, subject-matter research, remediation plan, and prompt package for the Leadership Message Foleon reader lane.  
**Status:** Planning / code-agent implementation package. No production code is changed by this package.

> Audit boundary: this package is based on the live `main` branch inspected through GitHub connector access, the user-provided hosted screenshot, and public subject-matter research. Hosted validation was screenshot-based only; no authenticated browser automation was run against the tenant in this session.


## Subject-Matter Research Summary

### Foleon platform and embed behavior

Foleon should remain the source of rich-media authoring and primary article experience. The HB Central reader should not replicate article content. It should present a governed access point, with enough context and confidence for the employee to open the Foleon document.

Key findings:

- Foleon exposes a REST API and API resources for Docs/editions. HB Intel should keep syncing metadata and URLs, not reauthoring the message body.
- Foleon iframe embedding is a supported approach but carries tradeoffs: it keeps visitors in the host site, but requires source URLs, may create scrollbar/height issues, and depends on embedding permissions and parent/iframe postMessage behavior.
- Foleon’s iframe guidance includes origin validation in the parent message listener and in-doc scripts for dynamic height and page-change events. The existing HB Intel origin policy and full-window viewer posture should remain intact.

### SharePoint / SPFx constraints

SharePoint-hosted web parts must behave in real SharePoint canvas conditions:

- 100% width behavior and reflow down to 320 px minimum;
- credible edit-mode behavior;
- accessible keyboard/screen-reader behavior;
- no duplicate or fake SharePoint chrome;
- no reliance on ideal page section width;
- accessibility testing beyond simple visual inspection.

The Leadership lane is hosted inside a homepage row and must be container-aware, not just viewport-aware.

### Executive communication and intranet patterns

Leadership messages on intranets should build trust, alignment, and consistency. They work best when they are easy to find, clearly attributed, and tied to company direction. The reader should convey:

- source credibility;
- strategic theme;
- currentness;
- concise value;
- direct path to full message;
- consistent cadence without leaking internal management metadata.

The product should support video/rich-media messages and not over-assume a written CEO letter.

### Editorial hierarchy and digital reading patterns

Employees scan intranet pages. The Leadership reader must use an inverted-pyramid structure:

1. main value statement / headline;
2. summary or key message;
3. source and status;
4. CTA;
5. optional restrained metadata.

Do not bury the useful information under badges, labels, or body copy. Use short paragraphs, meaningful headings, and a clear CTA.

### External CMS / content access point patterns

For content managed in an external CMS or rich-media platform, the host app should separate:

- content ownership: Foleon;
- metadata and placement governance: HB Intel / Foleon Manager;
- presentation shell: HB Central;
- launch and viewer policy: shared Foleon reader.

The host app should model content objects, not mimic full page layouts. Preview states should help managers validate placement without pretending the content is live.

## Practical Design Rules for Leadership Message

1. **Lead with employee meaning, not lane mechanics.**
   - Use `A message from leadership`, `Latest leadership update`, or the actual Foleon title.
   - Never use `Leadership Message reader` as the visible production title.

2. **Show enough context to open, not enough text to replace Foleon.**
   - Summary/teaser is acceptable.
   - Full article body is not.

3. **Use executive identity only when real.**
   - If executive name/role/photo are unavailable, use `From leadership` or omit the identity block.
   - Do not show `Executive byline not provided.` in production.

4. **CTA must be visible and explicit.**
   - Use `Read the leadership message`, `Open full message`, `Watch the message`, or `Open in Foleon`.
   - The CTA label should reflect open mode and available media.

5. **Treat preview as author validation, not a fake article.**
   - Preview copy: `Preview content shown for layout validation only.`
   - Do not display sample byline, sample role, sample quote, or sample audience as content.

6. **Metadata must earn its place.**
   - Published date: useful.
   - Topic/category: useful if specific.
   - Audience: useful only if targeted or non-companywide.
   - Cadence/archive group: internal; omit from employee view unless rewritten as period/currentness.

7. **Design for credibility.**
   - Calm background treatment, strong typography, restrained accenting, and sufficient whitespace.
   - No nested card pile and no generic enterprise card grid.

8. **Design for homepage density.**
   - Desktop paired row: compact two-zone layout.
   - Single column / mobile: source/status above headline, CTA retained immediately after summary.

## Research Sources

- Foleon Developer Documentation — Getting Started: https://developers.foleon.com/getting-started/
- Foleon API: https://developers.foleon.com/apis
- Foleon iframe embedding guide: https://developers.foleon.com/guides/i-frame-embedding
- Microsoft SharePoint web part accessibility guidance: https://learn.microsoft.com/en-us/sharepoint/dev/design/accessibility
- Microsoft SharePoint web part design considerations: https://learn.microsoft.com/sharepoint/dev/spfx/web-parts/basics/design-considerations-for-web-parts
- Microsoft SharePoint design guidance overview: https://learn.microsoft.com/en-us/sharepoint/dev/design/design-guidance-overview
- Australian Government Style Manual — inverted pyramid: https://www.stylemanual.gov.au/structuring-content/types-structure/inverted-pyramid
- Newcastle University readability guidance summarizing Nielsen Norman Group web-reading research: https://www.ncl.ac.uk/design-system/ux/editorial/readability/
- Simpplr — Executive engagement best practices: https://support.simpplr.com/hc/en-us/articles/360052829194-Best-Practices-Executive-Engagement
- Simpplr — Managing a successful intranet: https://help.simpplr.com/hc/en-us/articles/5687221431827
- Microsoft Viva employee communications: https://www.microsoft.com/en-us/microsoft-viva/employee-communications-and-communities
- Contentful content preview: https://www.contentful.com/help/content-preview/
- Storyblok content modeling: https://www.storyblok.com/mp/content-modeling-explained
