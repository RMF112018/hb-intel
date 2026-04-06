# Prompt 02 — Implement the Default Hero Background Asset

## Objective

Use the provided `banner_home_7.png` image as the default hero background, but do it in a deployment-safe way.

Do not use the user's absolute local filesystem path in shipped runtime code.

## User-Provided Source Image

The user provided this local source path for the image:

`/Users/bobbyfetting/Library/CloudStorage/SynologyDrive-BFmacSync/Work/NAS - HB/SOP/Sharepoint/HB_images/banner_home_7.png`

Your local environment should use that file as the source to copy from.

## Required Tasks

### 1. Copy the image into the repo
Copy `banner_home_7.png` into an appropriate repo-controlled asset location for the hero/webpart.

Use a location that is consistent with the existing `hb-webparts` runtime asset strategy.

Do not leave the hero dependent on the user's local macOS path.

### 2. Wire the image as the default background
Update the Signature Hero so that:
- the default background uses the copied repo asset
- the default image is used automatically when no explicit override is provided

### 3. Preserve center-crop behavior
The background must:
- use `background-size: cover`
- use `background-position: center center`
- avoid distortion
- crop from center only

### 4. Keep the image premium in use
Do not add heavy overlays.
Do not use a decorative gradient wash.
If a readability scrim is still needed, keep it restrained and subordinate to the photography.

## Hard Gates

- Do not use the absolute `/Users/...` path in production/runtime code.
- Do not compress, stretch, or distort the image.
- Do not regress full-width section usage.
- Do not revert to the plain fallback slab unless the image fails to resolve.

## Deliverables

- repo-controlled image asset
- updated hero background wiring
- concise note explaining asset placement and background fallback behavior

## Validation

Before finishing, prove:
- `banner_home_7.png` exists in the repo-controlled asset location
- the hero uses it by default
- the image center-crops correctly
- the shorter hero height still presents the image well
