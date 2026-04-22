# Homepage Launcher Fresh-Build Design Package — Revised

This package defines the **design, product contract, implementation posture, and cutover guidance** for the homepage launcher replacement.

## Core correction

This revised package is **site-agnostic**.

It contains **no reference to any specific SharePoint site** as the required host for the launcher, its lists, or its administration surface.

That hosting decision is an implementation/deployment concern and should be decided separately from the launcher design contract.

## Locked design position

- This is a **totally fresh build**.
- Nothing from the current launcher render implementation is to be copied forward except the approved **icon assets / iconography language**.
- The launcher must preserve the intended **tile design language**.
- The `More Tools` tile must become a seamless peer in the primary row using the **same tile shape, sizing contract, and interaction model**, with the existing unique orange shading retained.
- The drawer must become a **single-row bottom sheet carousel** using the same tile design language as the primary row.
- Grouped drawer sections, helper hint text, visible scrollbar treatment, and legacy overflow furniture are out of scope for the new build.

## Package contents

- `00-Design-Summary.md`
- `01-Current-Failure-Interpretation.md`
- `02-Future-State-Launcher-Product-Model.md`
- `03-Launcher-Application-and-Integration-Architecture.md`
- `04-Tile-and-More-Tools-Contract.md`
- `05-Drawer-and-Carousel-Contract.md`
- `06-Implementation-and-Cutover-Plan.md`
- `07-Agent-Execution-Contract.md`

## Important boundary

This package intentionally does **not** lock:
- a specific SharePoint site
- a specific list host site
- a specific list URL
- a specific app-catalog deployment target

Those decisions belong in implementation planning, provisioning, and deployment documentation — not in the launcher design package.
