# External Implementation References

These references are informational only. Repo doctrine and this package govern implementation.

## Microsoft SPFx

Microsoft describes SPFx as the supported SharePoint page/webpart model for client-side SharePoint development, using normal page DOM rendering and responsive/mobile-ready app experiences.

- https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview

## Container Queries

MDN documents `container-type: inline-size` as establishing an inline-axis query container, which supports container-aware composition rather than viewport-only layout decisions.

- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/container-type
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries

## ResizeObserver

MDN documents `ResizeObserver` as reporting changes to the dimensions of an element, supporting the PCC bento grid's container measurement and row-span recovery posture.

- https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
- https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver/observe

## Accessibility

Use semantic heading order, visible labels, `aria-labelledby`, and state announcements consistently. Repo tests should verify DOM semantics instead of relying on visual styling alone.
