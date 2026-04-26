# Standalone Foleon Alignment Plan

## Objective

Align the standalone Foleon app with the third Leadership Message lane.

The standalone app should support:

- `projectSpotlight`;
- `companyPulse`;
- `leadershipMessage`;
- legacy `highlights`;
- `hub`;
- `reader`;
- `manage`.

## Route addition

Add route:

```text
leadershipMessage
```

Update:

- route union;
- route parser;
- route announcement;
- `renderPage`;
- runtime proof route value;
- telemetry page context;
- tests.

## Toolbox entry

Add a Foleon toolbox entry:

```text
HB Intel Leadership Message Reader
```

Do not remove:

- Project Spotlight Reader;
- Company Pulse Reader;
- Manager;
- legacy Highlights until migration is complete.

## Versioning

If standalone Foleon source/package changes and is intended for tenant deployment, bump Foleon version coherently from the current version to the next version across all version-bearing files and package-proof validation.

## Preview

Leadership preview should follow restored Foleon preview quality:

- banner/header;
- refined leadership/executive gradient;
- feature placeholder;
- supporting content zones;
- metadata/status;
- content-coming-soon language;
- no fake actions;
- no iframe;
- no preview telemetry.

## Service behavior

Do not duplicate reader resolution. Use the shared reader service/config.

Leadership should resolve records with:

```text
ReaderKey = leadership-message
ContentTypeKey = Leadership
PlacementKey = Leadership Message Active
```

## Tenant readiness

Standalone Leadership route should not be deployed before tenant choice values are provisioned.
