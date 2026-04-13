# hbSignatureHero — Dynamic Article Hero Audit + Prompt Package

## Objective

This package is the execution output of a repo-truth audit of the live `main` branch for `hbSignatureHero` in `RMF112018/hb-intel`.

The package is built around one controlling requirement:

- **If the hero is hosted at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`, its current flagship homepage behavior must remain unchanged.**

At the same time, the package defines the correct architecture to support **dynamic article rendering** for non-HBCentral article contexts.

## Final architecture judgment

The correct answer is **structural redesign with a dual-mode surface-family architecture**, not a simple prop extension and not a wholesale replacement.

### What stays

- The current HBCentral flagship hero behavior stays locked.
- The homepage branch remains the authoritative flagship identity surface.
- The homepage branch must not absorb article furniture.

### What changes

- Introduce a **mode resolver** that hard-locks homepage behavior on HBCentral.
- Add an **article-mode contract** for non-HBCentral usage.
- Reuse the **shared identity/photo seam** proven by Kudos, without coupling to Kudos runtime code.
- Keep shared logic beneath thin mode-specific adapters.

## Package contents

1. `00-Plan-Summary.md`
2. `01-Audit-Summary.md`
3. `02-Current-State-Architecture-and-Gap-Register.md`
4. `03-Decision-Lock.md`
5. `04-Target-Architecture-and-Mode-Model.md`
6. `05-Implementation-Prompt-01-Lock-HBCentral-Mode.md`
7. `06-Implementation-Prompt-02-Introduce-Article-Mode.md`
8. `07-Implementation-Prompt-03-Wire-Author-Identity-and-Photo-Seam.md`
9. `08-Implementation-Prompt-04-Property-Pane-and-Runtime-Integration.md`
10. `09-Implementation-Prompt-05-Stories-Harness-and-Visual-Proof.md`
11. `10-Validation-and-Closure-Prompt.md`
12. `HBSignatureHero-Exhaustive-Audit.md`

## Execution order

Run the implementation prompts in strict sequence.

Do not skip ahead.

Do not blend closure units.

Each prompt is intentionally scoped so the code agent closes **one architectural seam at a time** before advancing.

## Locked constraints

- Preserve HBCentral flagship behavior exactly.
- Do not flatten the homepage hero into a generic article hero.
- Do not directly import or couple article rendering to `hbKudos/*` runtime modules.
- Reuse shared identity/photo mechanics only.
- Stay aligned with:
  - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
  - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Recommended implementation posture

- **Homepage branch:** preserve current `HbSignatureHero` visual/output contract.
- **Article branch:** add a separate adapter with an explicit article view model.
- **Shared seam:** use a lower-level surface/utility layer for shared rendering concerns, not a homepage-first prop soup.

## Closure standard

The work is only complete when all of the following are true:

- HBCentral render path is unchanged.
- Non-HBCentral article render path works with dynamic article inputs.
- Author name/photo uses a shared identity/photo seam derived from the existing Kudos pattern.
- The affected footprint is scrubbed for stale, duplicate, or contradictory code.
- Story/harness/visual proof exists for both modes.
- Packaging/build/runtime validation is green.
