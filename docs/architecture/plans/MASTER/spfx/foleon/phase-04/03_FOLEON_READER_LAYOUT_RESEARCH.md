# Foleon Reader Layout Research

## Source Types

This research separates sources into three levels:

1. Authoritative Microsoft / PnP / platform guidance.
2. General CSS/layout implementation guidance.
3. Editorial / intranet inspiration patterns requiring adaptation to HB Intel.

## Authoritative Microsoft / Platform Guidance

### SharePoint Web Part Design

Microsoft’s SharePoint web part design guidance emphasizes designing web parts with SharePoint page authoring, placeholders/fallbacks, titles/descriptions, property pane patterns, and configuration behavior in mind.

Source:
- https://learn.microsoft.com/en-us/sharepoint/dev/design/design-a-web-part

Implication for HB Intel:

- The preview fallback is correct in principle and should not be removed.
- The fallback needs to preview the real lane-specific final experience, not a generic placeholder.
- Configuration and preview states should remain honest and clearly labeled.

### SPFx Design Considerations

Microsoft SPFx design guidance recommends that web parts use a 100% maximum width and reflow properly across page/column widths. It warns against fixed maximum pixel widths because SharePoint page and column widths can change.

Source:
- https://learn.microsoft.com/ka-ge/sharepoint/dev/spfx/web-parts/basics/design-considerations-for-web-parts

Implication for HB Intel:

- Edge-to-window should not be implemented with hard-coded tenant-specific page widths.
- The Foleon readers and hero should remain 100%-width, container-aware surfaces.
- Minimum stable width should continue to support 320px and mobile layouts.

### SharePoint Grid and Responsive Design

Microsoft SharePoint grid guidance identifies responsive behavior as part of the SharePoint page authoring environment and ties page behavior to responsive grid/breakpoint concepts.

Source:
- https://learn.microsoft.com/en-us/sharepoint/dev/design/grid-and-responsive-design

Implication for HB Intel:

- The shell should own breakpoint behavior and zone placement.
- Reader layout components should respond to shell/container state, not define global page breakpoints in isolation.

### Viva Connections Home Experience

Microsoft Viva Connections guidance highlights a composed experience made from Announcements, Spotlight, Dashboard, Resources, and a News reader. It also describes content targeting, news reader behavior, and curated experiences.

Sources:
- https://learn.microsoft.com/en-us/viva/connections/edit-viva-home
- https://learn.microsoft.com/en-us/sharepoint/viva-connections-desktop

Implication for HB Intel:

- HB Intel’s Project Spotlight, Company Pulse, and Leadership Message should behave like different communication lanes:
  - Project Spotlight: curated spotlight/feature.
  - Company Pulse: news reader/digest.
  - Leadership Message: announcement/executive communication.
- The homepage should not treat all communication lanes as equivalent cards.

### Fluent 2 Layout Guidance

Fluent 2 layout guidance frames responsive layout through repositioning, resizing, and showing more or less content. It specifically recognizes that a hero component can stretch to full window width to show more background image.

Source:
- https://fluent2.microsoft.design/layout

Implication for HB Intel:

- Differentiation should come from actual responsive composition changes.
- The hero can reasonably use full-width/edge-to-window treatment if the SPFx and SharePoint host context allow it.
- Project Spotlight can use a stronger image/hero treatment than Company Pulse or Leadership Message.

## CSS / Layout Implementation Guidance

### CSS Container Queries

MDN describes container queries as a way to apply styles based on a container’s size rather than only the viewport. This aligns with HB Intel’s shell-owned, container-aware architecture.

Source:
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries

Implication:

- Foleon reader layouts should use container queries where possible.
- Do not rely only on viewport media queries because SharePoint sections and shell slots may produce different available widths at the same viewport size.

### CSS Logical Properties

MDN’s logical properties guidance supports margin/padding/border definitions that adapt to writing mode and direction.

Source:
- https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values/Margins_borders_padding

Implication:

- Use `margin-inline`, `padding-inline`, `inset-inline`, etc., for edge-bleed logic.
- Avoid brittle left/right physical properties except where the shell has resolved a specific visual side.

### Horizontal Overflow Control

MDN’s overflow guidance explains that `overflow-x` governs horizontal overflow and that `clip` / `hidden` prevent overflow from rendering outside the element.

Source:
- https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x

Implication:

- Edge bleed must be proven with browser layout tests, not just JSDOM.
- Use local clipping only when needed and avoid masking real overflow defects globally.
- The safer pattern is controlled negative margin / compensated padding based on known shell inset variables, not a global `overflow-x: hidden` band-aid.

## Editorial / Intranet Design Pattern Adaptation

### Project Spotlight

Common pattern:
- hero image / feature story / project metadata / story context / team/client/milestones.

HB adaptation:
- Use a visual editorial panel.
- Avoid three generic support cards.
- Align to monthly cadence and archive gallery.

### Company Pulse

Common pattern:
- newsroom digest / lead item / recent updates / category chips / freshness.

HB adaptation:
- Make it the most scannable lane.
- Emphasize frequent updates and operational relevance.
- Use update density instead of large hero art.

### Leadership Message

Common pattern:
- executive letter / byline / signature / pull quote / focused message.

HB adaptation:
- Make it calm, restrained, and authoritative.
- Reduce decorative preview chrome.
- Use typography, byline, and message hierarchy instead of media blocks.

## Research Conclusion

The repo should not use one universal card skeleton for all Foleon lanes. Microsoft and Fluent guidance supports responsive, composed, purpose-specific modules. CSS guidance supports container-aware and logical-property-based implementation. The recommended design is lane-owned composition with shared governance/runtime behavior.
