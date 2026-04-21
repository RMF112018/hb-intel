# Objective

Verify that the flagship hero and entry stack survive real SharePoint hosting and package/build truth across the audited breakpoint matrix.

## Governing authority
- SPFx governing standard
- homepage overlay
- homepage UI/UX audit checklist
- homepage UI/UX audit scorecard

## Inspect first
- manifest and packaging seams
- hosted page configuration actually used for validation
- any homepage verification docs already present in repo

## Required proof
Provide:
1. hosted screenshots at:
   - 2560x1440 dpr1
   - 1366x768 dpr1
   - 1512x982 dpr2
   - 1920x1080 dpr1
   - 834x1210 dpr2
   - 402x872 dpr3
   - 440x956 dpr3
2. notes for:
   - hero height behavior
   - launcher behavior
   - first-lane-first-view behavior
   - handheld and tablet compact-state behavior
3. explicit confirmation that the packaged result matches intended source behavior

## Prohibitions
- no “looks good enough” closure
- no local-only screenshots as the sole proof
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
