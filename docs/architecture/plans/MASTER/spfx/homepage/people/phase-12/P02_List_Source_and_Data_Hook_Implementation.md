# P02 — List Source and Data Hook Implementation

## Objective

Implement the People & Culture SharePoint list-source module and data hook so the webpart can use live SharePoint lists as its primary runtime content source.

## Scope

Create only the minimum new data-layer files required.

## New files to add

- `apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`

## Pattern to follow

Use the Project Spotlight pattern as the direct reference model:

- `projectSpotlightListSource.ts`
- `useProjectSpotlightData.ts`
- `spContext.ts`

Do not invent a new homepage data-access architecture.

## Requirements for `peopleCultureListSource.ts`

Implement a dedicated SharePoint list-source module that:

1. reads from the `HBCentral` site URL provided by `getSiteUrl()`
2. resolves live field metadata for each list before composing item queries where needed
3. fetches raw list items for:
   - announcements
   - kudos
   - celebrations
4. maps raw SharePoint items into the existing repo-truth contracts:
   - `AnnouncementEntry`
   - `KudosEntry`
   - `WeeklyCelebrationEntry`
5. returns a `Partial<PeopleCultureMergedConfig>`-compatible object

## Recommended exports

Use a clean, narrow surface similar to Project Spotlight.

Recommended shape:

```ts
export interface PeopleCultureListDataResult {
  config: Partial<PeopleCultureMergedConfig>;
}

export async function fetchPeopleCultureListData(
  siteUrl: string,
  now = new Date(),
): Promise<PeopleCultureListDataResult> { ... }
```

You may add small supporting helpers inside the file for:
- field metadata lookup
- user/person mapping
- taxonomy parsing
- thumbnail parsing
- URL extraction
- list item explosion for celebrations with multi-person rows

## Mapping rules

### Announcements
Map to `AnnouncementEntry`.

Required behaviors:
- use resolved live internal names
- strip any rich text to plain text for `summary`
- resolve `personName` from person field first, fallback to `PersonDisplayName`
- map CTA and image fields when present
- preserve dates / pin / priority / homepageEnabled / audiences

### Kudos
Map to `KudosEntry`.

Required behaviors:
- merge recipients from all four source columns
- resolve user recipients into named recipients
- map taxonomy recipients into named recipients
- synthesize `status` if no dedicated live field exists:
  - `approved` if approval state exists
  - otherwise `pending`
- keep `celebrateCount`
- preserve publish window fields and image fields

### Celebrations
Map to `WeeklyCelebrationEntry`.

Required behaviors:
- normalize `CelebrationType` to lowercase
- only emit values compatible with current contract:
  - `birthday`
  - `anniversary`
- if a row has multiple people, explode to one output entry per person
- build a stable ID per emitted row, e.g. `<baseId>:<personId>`
- resolve `personName` from live person values, fallback to `PersonDisplayName`
- keep image and audience data when available

## Field parsing hardening

Handle all of these safely:

### Person fields
Support:
- single user expanded object
- multi-user `results` arrays
- null / missing user
- fallback display-name text

### Taxonomy fields
Support:
- hidden note companion field `_0`
- serialized label payloads
- plain string fallback
- empty / null values

### Thumbnail / image fields
Support the practical shapes SharePoint may return, including:
- modern thumbnail object
- JSON string payload
- plain URL string
- server-relative URL needing site URL prefix

### URL fields
Support:
- plain string
- `{ Url, Description }` object

## Requirements for `usePeopleCultureData.ts`

Implement a hook analogous to `useProjectSpotlightData()`:

- use `getSiteUrl()`
- short-lived cache
- loading state
- error state
- return `undefined` config immediately when no SPFx site URL is present so the component can fall back cleanly

Recommended return shape:

```ts
export interface PeopleCultureDataResult {
  listConfig: Partial<PeopleCultureMergedConfig> | undefined;
  isLoading: boolean;
  error: string | undefined;
}
```

## Acceptance criteria

- new data files compile
- no change required to `spContext.ts`
- hook returns live-list-backed config when site URL exists
- hook returns `undefined` config when site URL does not exist
- mapping is contract-compatible
- malformed schema assumptions are contained at the adapter boundary
