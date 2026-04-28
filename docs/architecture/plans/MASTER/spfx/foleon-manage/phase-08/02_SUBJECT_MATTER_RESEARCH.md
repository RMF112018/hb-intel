# 02 — Subject-Matter Research

## Research Summary

The correct Manager model is not “cards and tabs.” It is an editorial/news-feed operations desk.

Modern CMS/news workflows consistently use:

1. A content list or queue as the default workspace.
2. Clear content states: draft, staged, live, scheduled, blocked, archived.
3. Filters/search to find content quickly.
4. A details/inspector panel for selected content.
5. Preview before publishing.
6. Scheduling/display windows.
7. Role-aware controls and publish permissions.
8. Admin/config separated from daily editorial work.

## Foleon Platform Principles

Foleon’s API is RESTful, uses HTTP/JSON patterns, authenticates with bearer tokens, and exposes Docs/editions and Projects/titles. This supports an integration pattern where Foleon is the source content system and HB Intel synchronizes metadata and placement state.

Sources:
- https://developers.foleon.com/apis
- https://developers.foleon.com/getting-started/

Foleon embed behavior is iframe/source URL dependent, and embed success depends on whether the source website permits embedding. This means a governed preview flow must be explicit, safe-origin-gated, and must not silently iframe unknown content.

Source:
- https://www.foleon.com/knowledge/all-about-the-embed-element

## SharePoint/SPFx Principles

SPFx full-width behavior requires explicit `supportsFullBleed: true`, and SharePoint regular sections have intentional max-width constraints. A Manager app intended to be a primary management page must be tested in full-width section placement and constrained section placement.

Source:
- https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/basics/use-web-parts-full-width-column

## Microsoft Graph / SharePoint List Principles

SharePoint list item data is accessed through Graph list items and `fieldValueSet` field values. The Manager should keep Graph/list mapping in typed services/view models, not scatter list-field semantics through JSX.

Source:
- https://learn.microsoft.com/en-us/graph/api/resources/fieldvalueset

## CMS / Editorial Workflow Patterns

### WordPress

WordPress post management centers on a posts table/list with filtering, search, status visibility, row actions, quick edit, and bulk operations. That model remains effective because a content manager’s default task is finding and acting on content, not navigating a dashboard.

Source:
- https://wordpress.org/documentation/article/posts-screen/

### Webflow CMS

Webflow distinguishes staged/draft content from live content, supports publishing individual CMS items, and uses staging/production concepts to protect production from unintended changes.

Sources:
- https://developers.webflow.com/data/docs/working-with-the-cms/publishing
- https://help.webflow.com/hc/en-us/articles/46651740529811-Publishing-workflow

### Contentful

Contentful workflows and scheduled publishing reinforce the importance of role-aware workflow steps, scheduled publish/unpublish actions, calendar/list views, and clear future-state visibility.

Sources:
- https://www.contentful.com/help/workflows/
- https://www.contentful.com/help/scheduled-publishing/
- https://www.contentful.com/help/launch/create-manage-release/working-with-release-calendar/

### Storyblok

Storyblok’s content workflow model emphasizes clear stages such as drafting, reviewing, and ready to publish. It also separates workflows, releases, pipelines, comments, and assignments to support team-based publishing.

Sources:
- https://www.storyblok.com/docs/editor-guides/workflows-basic-custom
- https://www.storyblok.com/docs/manuals/content-authoring

### Sanity

Sanity’s content releases emphasize previewing and validating before publishing, scheduling releases, and avoiding conflicts when multiple content changes are layered.

Source:
- https://www.sanity.io/content-releases

## Accessibility Patterns

Primary tab navigation must follow WAI-ARIA tab pattern expectations: tablist, tab, tabpanel, selected state, keyboard arrow behavior, Home/End support where implemented, and sensible focus progression.

Source:
- https://w3c.github.io/wai-website/ARIA/apg/patterns/tabs/

Workflow panels/dialogs must manage focus explicitly. If modal-like, focus stays within the dialog and Escape closes it. When closed, focus should return to the invoking control.

Source:
- https://www.w3.org/TR/2018/WD-wai-aria-practices-1.2-20180719/

## Design Rules Translated for HB Intel

1. The default view must be a queue, not a card board.
2. Feed lanes/channels are filters/slots, not primary navigation.
3. Every row must have a clear next action.
4. Every blocked state must explain owner, cause, and next action.
5. Admin diagnostics must not appear in the primary editorial path.
6. Preview must be safe-origin-gated and explicit.
7. Schedule/display windows need a dedicated workspace.
8. UI structure should be queue + slots + inspector, not nested cards.

