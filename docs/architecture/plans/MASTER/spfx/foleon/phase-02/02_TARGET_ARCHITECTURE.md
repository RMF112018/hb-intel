# Target Architecture — Two Governed Foleon Reader Lanes

## Architectural Intent

Implement two dedicated HB Central homepage reader modules:

```text
ProjectSpotlightFoleonReader
CompanyPulseFoleonReader
```

Both should share a single underlying reader module:

```text
FoleonReaderModule
```

The shared module owns:

- data loading;
- record resolution;
- reader gate evaluation;
- iframe host rendering;
- blocked/error/preview states;
- telemetry emission;
- responsive behavior;
- archive affordance shell.

The configured wrappers provide:

- lane identity;
- copy;
- content type;
- placement key;
- cadence;
- layout dominance;
- metadata visibility;
- mobile behavior.

## Recommended Reader Config

```ts
export type FoleonReaderKey = 'project-spotlight' | 'company-pulse';

export interface FoleonReaderModuleConfig {
  readonly readerKey: FoleonReaderKey;
  readonly route: 'projectSpotlight' | 'companyPulse';
  readonly title: string;
  readonly subtitle: string;
  readonly contentTypeKey: 'Project Spotlight' | 'Company Pulse';
  readonly placementKey: 'Project Spotlight Active' | 'Company Pulse Active';
  readonly cadenceLabel: string;
  readonly defaultHeight: number;
  readonly maxCollapsedHeight: number;
  readonly allowArchive: boolean;
  readonly allowExternalOpen: boolean;
  readonly showMetadataRail: boolean;
  readonly desktopRole: 'primary' | 'secondary';
}
```

## Reader Config Values

```ts
export const FOLEON_READER_CONFIGS = {
  projectSpotlight: {
    readerKey: 'project-spotlight',
    route: 'projectSpotlight',
    title: 'Project Spotlight',
    subtitle: 'Monthly profile of an active HB project',
    contentTypeKey: 'Project Spotlight',
    placementKey: 'Project Spotlight Active',
    cadenceLabel: 'Monthly',
    defaultHeight: 720,
    maxCollapsedHeight: 720,
    allowArchive: true,
    allowExternalOpen: true,
    showMetadataRail: true,
    desktopRole: 'primary',
  },
  companyPulse: {
    readerKey: 'company-pulse',
    route: 'companyPulse',
    title: 'Company Pulse',
    subtitle: 'Company news, events, updates, and recognition',
    contentTypeKey: 'Company Pulse',
    placementKey: 'Company Pulse Active',
    cadenceLabel: 'Updated frequently',
    defaultHeight: 620,
    maxCollapsedHeight: 620,
    allowArchive: true,
    allowExternalOpen: true,
    showMetadataRail: false,
    desktopRole: 'secondary',
  },
} as const;
```

## Recommended Route Strategy

Extend the Foleon route model to include:

```ts
export type FoleonRoute =
  | 'highlights'
  | 'reader'
  | 'hub'
  | 'manage'
  | 'projectSpotlight'
  | 'companyPulse';
```

Why explicit routes instead of a generic `readerModule` route?

- The package can expose two clear toolbox entries.
- Runtime proof can identify which reader lane is mounted.
- Telemetry route values remain obvious.
- Tests are simpler.
- Page authors do not need to manually choose `readerKey`.
- It aligns with the requirement for two separate governed modules.

## Toolbox Entries

Add preconfigured entries:

```text
HB Intel Project Spotlight Reader
HB Intel Company Pulse Reader
HB Intel Foleon Manager
```

Decision point:

- Retain `HB Intel Foleon Highlights` as a legacy entry for one release, or
- hide it from toolbox after the new readers are validated.

Recommended: retain for one transition release but mark as legacy in docs. Do not delete the route until tenant pages are migrated.

## Data Flow

```text
FoleonReaderModule(config)
  ├─ fetch active placement by config.placementKey
  ├─ fetch content candidates by config.readerKey / contentTypeKey / public readiness
  ├─ resolve one active record
  ├─ evaluate reader gate
  ├─ render iframe if allowed
  ├─ render blocked state if not allowed
  └─ render preview if configured-empty / no renderable active record
```

## Active Record Resolution Rule

### Project Spotlight

```text
ReaderKey = project-spotlight
ContentTypeKey = Project Spotlight
PublishStatus = Published
IsVisible = true
IsHomepageEligible = true
ActiveEdition = true
DisplayFrom <= today
DisplayThrough blank or >= today
Sort DisplayFrom desc, PublishedOn desc
Limit 1
```

### Company Pulse

```text
ReaderKey = company-pulse
ContentTypeKey = Company Pulse
PublishStatus = Published
IsVisible = true
IsHomepageEligible = true
ActiveEdition = true
Sort LastEditorialUpdate desc, PublishedOn desc
Limit 1
```

## Placement Relationship

Use placement records for homepage lane activation:

```text
Project Spotlight Active → Project Spotlight reader
Company Pulse Active     → Company Pulse reader
```

The content registry still owns editorial readiness (`ReaderKey`, `ActiveEdition`, `ArchiveGroup`, `Cadence`).

## Archive Behavior

Archive should be shared but filtered:

```text
Past Project Spotlights → ReaderKey = project-spotlight
Company Pulse Archive   → ReaderKey = company-pulse
```

Initial implementation can route archive clicks to Content Hub with filter state if a drawer is too much for the first wave. The long-term target is a side panel or drawer.

## Mobile Behavior

Desktop and tablet can render iframes, but mobile should not eagerly load two iframes.

Recommended:

- Desktop: iframe visible in both modules.
- Tablet: stacked modules with iframe.
- Mobile: collapsed cards first; user taps `Read Spotlight` or `Read Latest` to load/open reader.

This prevents the homepage from loading two iframe publications immediately on small screens.
