# Three-Lane Communications Target

## Target product model

The homepage should consume three Foleon-backed communications lanes:

| Lane | Replaces | Purpose | Foleon identity |
|---|---|---|---|
| Project Spotlight | Project Portfolio Spotlight | Monthly active project profile | `project-spotlight` |
| Company Pulse | Company Pulse / Newsroom | Company news, events, culture, recognition | `company-pulse` |
| Leadership Message | Message from Leadership | Executive communication and company direction | `leadership-message` |

## Target reader config

Recommended third-lane config:

```ts
leadershipMessage: {
  readerKey: 'leadership-message',
  route: 'leadershipMessage',
  title: 'Message from Leadership',
  subtitle: 'Executive communication and company direction',
  contentTypeKey: 'Leadership',
  placementKey: 'Leadership Message Active',
  cadenceLabel: 'Leadership Update',
  defaultHeight: 620,
  maxCollapsedHeight: 620,
  allowArchive: true,
  allowExternalOpen: true,
  showMetadataRail: false,
  desktopRole: 'primary'
}
```

## Why use `Leadership` content type

The Foleon model already includes `Leadership` as a content type. Use `ReaderKey` and `PlacementKey` to make it lane-specific rather than adding another content type unless a future product decision requires a more specific `Leadership Message` content type.

## Homepage replacement map

Use existing occupant IDs unless repo truth proves a different ID:

```text
project-portfolio-spotlight → Foleon Project Spotlight reader
company-pulse               → Foleon Company Pulse reader
leadership-message          → Foleon Leadership Message reader
```

If the actual leadership occupant ID differs, the code agent must inspect `occupantRegistry`, `shellTypes`, and `LeadershipMessageZone.tsx` before changing IDs.

## UI tone

| Lane | Preview tone |
|---|---|
| Project Spotlight | Blue gradient, feature/project profile |
| Company Pulse | Orange gradient, operational/news |
| Leadership Message | Executive/navy/blue-neutral gradient unless brand-approved third accent exists |

## Behavioral target

Each lane must:

- use the same reader gate;
- use the same iframe host;
- use the same scalar-safe public query discipline;
- resolve live content when available;
- render a polished preview fallback when configured but no active/renderable record exists;
- suppress preview production telemetry;
- preserve shell fit and breakpoint behavior.
