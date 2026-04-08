# P03 — Webpart Wiring and UI Preservation

## Objective

Wire `PeopleCultureMerged.tsx` to the new list-backed hook so the live SharePoint lists become the primary operating model, while preserving the existing premium UI treatment.

## Scope

Touch only the minimum existing files needed to switch runtime precedence and preserve fallback behavior.

## Primary file to update

- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`

## Secondary file to review/update only if needed

- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureWebPart.manifest.json`

## Implementation requirements

## 1. Keep the current premium UI direction
Do **not** flatten the existing design.

Preserve:
- warm gradient hero
- bold featured kudos spotlight
- avatar-rich treatment
- supporting highlights rail
- celebrations chip ribbon
- sparse-state invitation surface
- reduced-motion behavior

The objective is **live data integration without losing the signature surface**.

## 2. Adopt Project Spotlight’s runtime precedence model
Mirror the Project Spotlight pattern:

- live list config is primary
- manifest props are fallback

Recommended component pattern:

```ts
const { listConfig, isLoading: listLoading } = usePeopleCultureData();

if (isLoading || listLoading) {
  return <HomepageLoadingState ... />;
}

const effectiveConfig = listConfig ?? config;
const output = normalizePeopleCultureMergedConfig(effectiveConfig, activeAudience);
```

## 3. Do not move raw SharePoint parsing into the component
`PeopleCultureMerged.tsx` must continue consuming normalized config-like data only.

Keep the component presentation-focused.

## 4. Preserve empty / sparse / fallback behavior
The component must still render intentionally when:
- lists are unavailable
- one of the lists is empty
- only celebrations are available
- only announcements are available
- kudos are unavailable
- all inputs are empty

Do not regress the current curated sparse-state behavior.

## 5. Manifest handling
Keep `PeopleCultureWebPart.manifest.json` fallback data, but make sure the code no longer treats it as the primary runtime source.

You may optionally tighten the manifest copy to better reflect the merged surface heading, but do not remove fallback safety.

## 6. Maintain compatibility with the existing normalizer
Do not broaden contracts unless a concrete compiler/runtime issue forces it.

The preferred path is:
- adapter maps raw list items into current contracts
- current normalizer keeps working

## Acceptance criteria

- `PeopleCultureMerged.tsx` uses the new hook
- live list config outranks manifest config
- UI remains bold / warm / premium
- no raw REST item handling leaks into the component
- existing empty-state logic still works
