# UI/UX, Breakpoint, and Preview Specification

## Homepage Communications Band

Target desktop composition:

```text
Homepage Communications Band
├── Project Spotlight Reader 60–65%
└── Company Pulse Reader     35–40%
```

## Visual Roles

### Project Spotlight

Role: primary / immersive.

Characteristics:

- stronger media area;
- project metadata rail;
- monthly status;
- more visual depth;
- large iframe height;
- archive link.

### Company Pulse

Role: secondary / operational.

Characteristics:

- compact header;
- latest update timestamp;
- tighter metadata;
- readable but smaller iframe;
- archive and submit-news affordance if supported.

## Desktop Behavior

- Render both reader lanes in a band.
- Project Spotlight should dominate width.
- Company Pulse should be compact but not cramped.
- Both should avoid fake shell chrome.

## Tablet Behavior

- Stack modules vertically.
- Keep iframes available if practical content height allows.
- Preserve clear headers and metadata.

## Mobile Behavior

- Do not load two iframes immediately.
- Render collapsed reader cards first.
- User opens one reader intentionally.
- Preview cards should show intended shape without fake CTAs.

## Preview States

Each reader needs a preview state:

### Project Spotlight Preview

Shows:

- preview banner;
- feature project placeholder;
- project snapshot metadata rail;
- future reader location;
- archive cue;
- no iframe;
- no buttons that imply content exists.

### Company Pulse Preview

Shows:

- preview banner;
- top stories placeholder zones;
- update timestamp placeholder;
- news/events/culture cue row;
- future reader location;
- archive cue;
- no iframe.

## Action Treatment

No fake CTAs.

Allowed:

- static pill: `Preview only · Reader appears when content is published`;
- explanatory text;
- non-interactive status label.

Not allowed:

- disabled `Read` button;
- anchor without href;
- fake `Open in Foleon`;
- fake iframe;
- telemetry for preview content.

## Accessibility

- Each module must have a clear accessible region label.
- Loading states must use status semantics.
- Preview states must be understandable to screen readers.
- Mobile collapsed behavior must be keyboard accessible.
- No critical meaning should depend on hover.
- Dynamic iframe height should not trap focus.

## Token and Styling

Use existing Foleon/homepage tokens and CSS modules. Avoid broad inline-style expansion. Avoid generic white-card grid posture.
