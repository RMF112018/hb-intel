# 03 — Verification and Hosted Cutover Proof

## Objective

Prove that the corrected row-pairing source actually lands in the packaged homepage webpart and is the code being served on the hosted SharePoint homepage.

## Governing files / standards

- `docs/how-to/verify-hb-intel-homepage-sppkg.md`
- `apps/hb-homepage/config/package-solution.json`
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `tools/build-spfx-package.ts`

## Proven risk being corrected

Even after source fixes, hosted closure is invalid unless the deployed SharePoint page is confirmed to be:

- serving the fresh `.sppkg`
- using the HB Homepage webpart
- authored in full-width mode
- exposing the runtime data markers that prove the corrected shell is active

## Required implementation / verification outcome

- rebuild `hb-intel-homepage.sppkg`
- confirm package version authority is aligned
- confirm the page uses the homepage webpart in full-width mode
- capture hosted DOM/runtime proof for the shell pairing state at target widths

## Required proof of closure

Return all of the following:

1. build command(s) used
2. version values observed in:
   - `package-solution.json`
   - feature version
   - `HbHomepageWebPart.manifest.json`
3. proof artifact summary from the homepage package verification lane
4. hosted screenshots plus DevTools evidence for:
   - `data-shell-entry-state`
   - `data-shell-width`
   - `data-shell-columns`
   - `data-shell-band-pairing-allowed`
   - `data-shell-band-pairing-reason`
5. explicit statement whether the hosted page is truly full-width

## Prohibitions

- do not call closure based only on source edits
- do not skip hosted runtime markers
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
