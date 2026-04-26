# Shared Reader Package Extraction Plan

## Objective

Create or update the shared Foleon reader package so all three lanes can be consumed by:

- standalone `apps/hb-intel-foleon`;
- homepage runtime under `apps/hb-webparts` / `apps/hb-homepage`.

## Package

Recommended package:

```text
packages/foleon-reader
```

Name:

```text
@hbc/foleon-reader
```

## Required public API

Export only bounded public reader primitives:

```ts
FoleonEmbeddedReaderLane
ProjectSpotlightReader
CompanyPulseReader
LeadershipMessageReader
createEmbeddedFoleonRuntimeContract
FoleonReaderModuleConfig
FoleonReaderResolution
```

## Package boundary

The package must not own:

- SPFx property-pane code;
- global `window.__hbIntel_foleon` mount;
- module-level React root;
- package-specific runtime proof globals;
- tenant-specific list IDs;
- homepage shell governance;
- tenant mutation/provisioning scripts.

The package must not import from:

```text
apps/hb-intel-foleon/src/*
```

Reusable reader code must move into the package or be adapted into clean package-level exports.

## Shared package behavior

The shared package must support:

- Project Spotlight lane;
- Company Pulse lane;
- Leadership Message lane;
- multi-instance rendering inside one React tree;
- route-aware preview fallback;
- live reader rendering through shared iframe host/gate;
- no production preview telemetry.

## Multi-instance safety

The shared reader path must not depend on:

- `window.__hbIntel_foleon`;
- single global root;
- singleton DOM container;
- module-level mount state;
- global route mutation.

Tests must prove two or three embedded lanes can render simultaneously.
