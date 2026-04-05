# SharePoint Page Authoring Guide

Practical instructions for site owners and content authors creating and maintaining pages on HB Central.

## Which page model should I use?

| I want to... | Use this template | Composition |
|--------------|-------------------|-------------|
| Update the HB Central homepage | **Do not self-service** — request through Product/Architecture | Lane A webparts in 5-zone composition |
| Post a company update or announcement | **Communications page** | Native hero + text + image web parts |
| Create a department landing page | **Utility / Landing page** | Native hero + quick links + text |
| Share a project status update | **Operational page** | Native text + image + file viewer |
| Publish a policy or procedure | **Simple content page** | Native single-column text |
| Create something not covered above | **Request architecture review** | Requires approval before creation |

## Step-by-step: Creating a standard page

### 1. Choose the right site

- Company-wide content → HB Central site
- Department content → Department hub site
- Project content → Project site

### 2. Create the page

1. Navigate to the site → **New** → **Page**
2. Choose **Blank** or an approved template if available
3. Set a clear, descriptive page title

### 3. Build the content

- Add a **Hero web part** if the page needs a visual header
- Use **Text web parts** for body content with proper heading hierarchy (H2, H3)
- Use **Image web parts** for supporting visuals (always add alt text)
- Use **Quick Links** for navigation-style content
- Use **File Viewer** for embedded documents

### 4. Review before publishing

- [ ] Title is clear and descriptive
- [ ] Content follows the template family guidance
- [ ] Images have alt text
- [ ] Links point to live, accessible destinations
- [ ] CTAs use action labels (not "Click here")
- [ ] Page doesn't exceed 8 web parts (excluding hero)
- [ ] Section layout is appropriate (1-column default)

### 5. Publish

- Click **Publish** (or **Republish** for updates)
- If the page needs to appear in navigation, submit a [navigation change request](./sharepoint-navigation-operating-guide.md)

## When to avoid custom webparts

**Most pages should NOT use custom webparts.** Native SharePoint web parts are sufficient for:

- Text, headings, and lists → Text web part
- Images and media → Image / Video web parts
- Navigation tiles → Quick Links web part
- Embedded files → File Viewer web part
- Dynamic content → Highlighted Content web part
- Page hero → Hero web part

**Custom Lane A webparts are reserved for the homepage only.** If you think your page needs a custom webpart, request an architecture review.

## When to request product / architecture help

| Situation | Route To |
|-----------|----------|
| "I want homepage webparts on my page" | Architecture — Lane A is homepage-only |
| "I want a new kind of page layout" | Architecture — may need a new template family |
| "I want to embed custom scripts/apps" | Architecture — assess supported patterns |
| "I want to change the site branding" | Brand lead + Site Owner — use native theme |
| "My page doesn't fit any template family" | Architecture — assess before creating |

## Common mistakes to avoid

| Mistake | Why it's wrong | What to do instead |
|---------|---------------|-------------------|
| Adding 15+ web parts to one page | Cluttered, slow, hard to maintain | Keep under 8 web parts; split into multiple pages |
| Using 3-column layout for text content | Cramped, hard to read | Use 1-column for content; 2-column only for parallel items |
| No alt text on images | Accessibility violation | Always add descriptive alt text |
| Vague CTAs ("Click here", "Learn more") | Poor usability and accessibility | Use action labels ("View report", "Download form") |
| Duplicating nav content in page body | Creates maintenance burden | Link to nav items; don't recreate them |
| Creating a page without a clear template | Leads to drift and inconsistency | Choose a template family first |

## Related documents

- [Branding and Page Template Rules](../../reference/sharepoint-branding-and-page-templates.md) — template families, approved patterns, governance
- [Navigation Operating Guide](./sharepoint-navigation-operating-guide.md) — how to request nav changes
- [Navigation Governance](../../reference/sharepoint-navigation-governance.md) — ownership and approval
