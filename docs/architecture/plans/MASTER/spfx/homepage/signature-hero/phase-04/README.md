# Hero Refinement + Configurable Background Package

## Objective

This package instructs the local code agent to refine the now-working Signature Hero and implement a SharePoint-configurable background image after the web part is added to the page.

This package is intentionally narrow.

It should:
- preserve the current working runtime and CSS loading behavior
- refine the hero visual composition
- use the provided `banner_home_7.png` image as the default hero background
- reduce the overall hero height
- remove `HB Central` from the hero
- rebalance the logo size
- reorder the greeting and tagline
- add a SharePoint property-pane background image override

It should **not**:
- reopen packaging-registry work
- redesign the hero from scratch
- change the locked minimal content model
- broaden the hero into an editorial/promotional banner

## Current Repo-Truth Starting Point

The current hero source already confirms:
- the hero is the rebuilt minimal flagship surface
- the hero currently renders the tagline before the greeting
- the hero still includes an `HB Central` lockup label
- the hero is still taller than desired
- the current source still supports optional background image input

## Package Sequence

Run these prompts in order:

1. `Prompt-01-Refine-Working-Signature-Hero.md`
2. `Prompt-02-Implement-Default-Hero-Background-Asset.md`
3. `Prompt-03-Add-SharePoint-Configurable-Background.md`
4. `Prompt-04-Clean-Rebuild-And-SharePoint-Proof.md`

## Hard Gates

- Do not disturb the runtime CSS-loading fix that is now working.
- Do not use the user's absolute macOS file path directly in shipped runtime code.
- Copy the default image into the repo and reference the repo-controlled asset.
- The hero must remain a full-width flagship surface.
- The hero content must remain minimal:
  - logo only
  - greeting
  - tagline
- The property-pane background override must fall back cleanly to the repo-default image when blank.
- Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.

## Expected Outcome

After this package is implemented:
- the hero is shorter and tighter
- the default background uses `banner_home_7.png`
- the hero crops from center without distortion
- `HB Central` is removed
- the logo is more balanced
- the text reads:
  - `Good {time of day}, {User first name}.`
  - `Build with GRIT.`
- SharePoint authors can override the background image from the property pane after adding the web part
