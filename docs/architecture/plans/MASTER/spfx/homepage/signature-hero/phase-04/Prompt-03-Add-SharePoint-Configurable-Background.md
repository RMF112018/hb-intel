# Prompt 03 — Add SharePoint-Configurable Background

## Objective

Make the hero background configurable from within SharePoint after the web part is added to the page.

Implement this through the SPFx property pane.

This phase should preserve the new default image while allowing authors to override it.

## Required Behavior

### Default behavior
If no custom background is configured in SharePoint:
- use the repo-controlled default `banner_home_7.png`

### Author override behavior
If a background image URL is provided in the property pane:
- use that configured image instead of the default

### Reset behavior
If the property-pane field is cleared:
- fall back to the default repo-controlled image again

## Recommended Implementation

Implement a practical, stable first version using a property-pane text field for the image URL.

Use a property like:
- `backgroundImageUrl`

If helpful, you may also add:
- property-pane description/help text explaining that a SharePoint-hosted image URL is recommended

Do not overcomplicate this phase with a custom image picker unless it is already trivial in the repo context.
The goal is working SharePoint-side configurability, not a bespoke authoring control.

## Required Tasks

### 1. Update the webpart property contract
Add the necessary webpart property for configurable background image override.

### 2. Update the property pane
Expose the background image override field in the property pane.

### 3. Update the render path
Ensure the hero resolves the effective image like this:
1. property-pane override URL, if present
2. repo-controlled default background image, otherwise

### 4. Preserve all existing visual behavior
The override image must still:
- center-crop
- fill the hero using cover
- keep the shorter hero height
- preserve the premium composition

## Hard Gates

- Do not require a code redeploy to change the hero background after this phase.
- Do not remove the repo-default fallback image.
- Do not use the user's local absolute path in the property default.
- Do not destabilize the working CSS/runtime behavior.

## Deliverables

- updated webpart property type(s)
- updated property pane configuration
- updated render logic for effective background resolution
- concise authoring note explaining how the background override works

## Validation

Before finishing, prove:
- the hero uses the default repo image when no property is set
- the hero uses the configured property-pane URL when provided
- clearing the field reverts to the default image
- SharePoint authors can change the image without another deployment
