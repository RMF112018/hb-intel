# Phase 05-02 — Branding and Page Template Rules

## Objective

Build the second half of Lane C by defining the branding and page-template standards that govern how HB Central pages are created and maintained in supported SharePoint, without degrading the completed Lane A homepage product or the completed Lane B shell-extension product.

This prompt is a governance and standards prompt. It should create durable operating rules, not speculative custom-code work.

## Required repo-truth inputs

Review at minimum:

- the outputs of Phase 05-01
- `docs/reference/sharepoint-homepage-shell-boundaries.md`
- `docs/reference/ui-kit/entry-points.md`
- the Phase 01–03 homepage completion notes and reference docs
- the Phase 04 completion notes
- `apps/hb-webparts/README.md`
- `apps/hb-shell-extension/README.md`

## Core task

Define the governance standards for:

1. **Branding alignment**
   - how native SharePoint branding, home-site branding, and custom lanes should align
   - what visual elements are owned by native configuration vs Lane A vs Lane B
   - how to preserve the premium HB Central tone without unsupported customization

2. **Page-template families**
   - homepage
   - communications / editorial pages
   - utility / landing pages
   - operational / update pages
   - pages that should remain simple native pages with governance only

3. **Approved composition patterns**
   - which pages may use Lane A webparts
   - when a page should use native SharePoint sections/components only
   - when Lane B placeholder presence is enough and no custom page-canvas treatment is needed
   - when a new page pattern requires architecture review

4. **Authoring and content rules**
   - page title and hero usage
   - section rhythm and density expectations
   - CTA usage rules
   - media and link hygiene
   - rules that prevent “pretty but chaotic” page sprawl

5. **Template governance**
   - page creation approval model
   - template change governance
   - deprecation / cleanup rules for pages that drift from standards

## Required deliverables

Create or update repo-ready markdown docs that include:

1. **Branding and page-template rules reference**
   - canonical rules for branding, approved patterns, and prohibited patterns

2. **Page template matrix**
   - template family
   - intended use
   - allowed composition patterns
   - owner / approver
   - escalation triggers

3. **Site-owner / author guide**
   - practical instructions for when to use each page model
   - when to avoid custom webparts
   - when to request product/architecture help

4. **Phase completion note**
   - files created/updated
   - decisions locked
   - verification performed
   - forward-looking deferred items

## Required standards

- Preserve supported SharePoint posture.
- Do not let page-template guidance turn into a backdoor for unsupported shell recreation.
- Do not dilute the homepage lane by allowing uncontrolled reuse everywhere.
- Keep page standards compatible with the existing token/doctrine direction, but do not require app-level custom code where native SharePoint is sufficient.

## Acceptance criteria

- Branding ownership is clear across native SharePoint, Lane A, and Lane B.
- Template families are explicit and practical.
- Site owners can tell which page pattern to use and when.
- The docs reduce the chance of random one-off page designs.
- The outputs are repo-ready and aligned to Phase 01–04 repo truth.

## Verification

Run and report any validation appropriate to the changed files. If the work is documentation-only, say so clearly and report the checks that were still performed.
