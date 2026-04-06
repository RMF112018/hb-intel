# Hero Refinement + Configurable Background Summary

## Intent

This package refines the now-working Signature Hero and adds a SharePoint-configurable background override.

## Scope

This package addresses:
- hero height
- default background image
- logo balance
- removal of `HB Central`
- text order
- SharePoint-side configurable background image

## This package does NOT address

- packaging registry
- stale asset routing
- runtime CSS loading
- broader homepage redesign

## Success Criteria

The next emitted `.sppkg` and SharePoint runtime must prove all of the following:

1. hero is shorter and tighter
2. default background is `banner_home_7.png`
3. image center-crops correctly
4. `HB Central` is removed
5. logo is more balanced
6. hero text order is:
   - `Good {time of day}, {User first name}.`
   - `Build with GRIT.`
7. SharePoint property pane can override the background image
8. clearing the override restores the default image
9. current working runtime/CSS behavior remains intact

## Recommended Sequence

1. refine working hero
2. add repo-controlled default image
3. add property-pane background override
4. clean rebuild and SharePoint proof
