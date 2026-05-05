# 10 — Project-Level Launcher Link Configuration

## Permitting

Users may add as many permitting instances as needed: AHJ portals, private provider portals, inspection request portals, permit status portals, and plan review portals. No AHJ scraping/submission/status automation is authorized.

## Progress Cameras

Supported provider labels include TrueLook, EarthCam, OxBlue, Sensera Systems / SiteCloud, Evercam, OpenSpace, DroneDeploy, Cupix, and other approved providers. MVP behavior is launch only. Iframe/current-image support is TODO/future-gated.

## Custom Links

Users may create custom links for uncommon project-related sites. They require draft/submission by approved role, hostname policy validation, PM/PX approval before active visibility, audit events, and no launch rendering while pending/rejected/blocked.

## URL Policy

HTTPS only. Block `javascript:`, `data:`, local network, localhost, private IP, and non-HTTPS schemes. Query strings are allowed but must not carry secrets/tokens.
