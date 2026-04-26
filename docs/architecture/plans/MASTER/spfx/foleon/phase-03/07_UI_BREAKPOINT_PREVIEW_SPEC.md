# UI, Breakpoint, and Preview Spec

## Three-lane visual intent

The three Foleon lanes should preserve the restored Foleon preview quality:

- Project Spotlight: blue gradient, feature/project profile.
- Company Pulse: orange gradient, company news/update posture.
- Leadership Message: executive/navy/blue-neutral gradient, focused leadership communication.

## Homepage shell fit

Do not redesign the shell layout. Fit each Foleon lane into the existing slot.

Expected:

- Project Spotlight remains a larger feature lane.
- Company Pulse remains the news/updates lane.
- Leadership Message remains the leadership-message lane.

## Breakpoints

The homepage and embedded readers must be validated across:

```text
wide desktop
desktop
tablet landscape
tablet portrait
phone portrait
short height
narrowest stable
```

Minimum behavior:

- no horizontal overflow;
- iframe does not eagerly mount in preview state;
- phone view remains single-column;
- short-height view reduces excess vertical chrome;
- no fake CTA or fake iframe in preview.

## Preview requirements

Each lane preview must include:

- preview banner/header;
- strong gradient hero treatment;
- feature placeholder;
- supporting zones;
- metadata/status rail;
- content-coming-soon language;
- static future-action note only;
- no disabled buttons;
- no anchors unless real and tested;
- no preview telemetry.

## Archive behavior

Archive affordance must be real or static.

Allowed:

- real navigation to Hub with lane filter if implemented and tested;
- static note such as `Archive available when live content is connected`.

Not allowed:

- fake archive button;
- disabled archive button;
- anchor with no real target.
