# Prompt 01 — Canonicalize the Signature Hero and Retire the Split Top-Band Path

## Objective

Make the **Signature Hero** the single canonical homepage hero surface for HB Central.

The repo currently contains both:
- a unified `HbSignatureHero` path
- older split-path hero pieces (`hbHeroBanner`, `personalizedWelcomeHeader`)

This phase must stop the homepage flagship composition from straddling both architectures.

## Important Working Rule

**Do not re-read files that are already in your active context window or current working memory.**
Re-open files only where necessary to validate or edit with precision.

## Scope

Audit and modify the real repo-truth implementation so that homepage flagship usage is canonicalized around:

- `apps/hb-webparts/src/webparts/hbSignatureHero/`

And not around:
- `apps/hb-webparts/src/webparts/hbHeroBanner/`
- `apps/hb-webparts/src/webparts/personalizedWelcomeHeader/`

## Required Actions

### 1. Confirm the canonical path
- inspect the current `HbSignatureHero` implementation and its manifest
- inspect the reference homepage composition
- confirm all current homepage reference usage points
- identify any remaining places where the split path is still treated as viable homepage flagship architecture

### 2. Lock the canonical homepage architecture
- make `HbSignatureHero` the canonical homepage top-band implementation
- update the reference composition and any shared homepage composition references accordingly
- ensure no homepage flagship reference path uses `hbHeroBanner` + `personalizedWelcomeHeader` as peer hero surfaces

### 3. Deprecate split-path flagship usage
Do **not** blindly delete old code if it could still be useful in a future non-flagship context, but:
- remove it from homepage flagship composition
- mark it clearly as non-canonical for flagship homepage use
- reduce ambiguity in naming/comments/docs where needed

### 4. Preserve production runtime realities
- maintain adjacent manifests where required
- preserve full-width / full-bleed support for the flagship hero
- do not break the SPFx-hosted runtime contract

## Hard Rules

- The flagship homepage top band must be one authored object.
- The rendered homepage flagship hero must not rely on a separate greeting webpart beside or below a separate hero webpart.
- Do not introduce shell chrome, fake nav, or unsupported SharePoint takeover behavior.
- Do not weaken full-width support.
- Do not do unrelated styling work in this prompt beyond what is necessary to canonicalize architecture.

## Deliverables

Produce:
1. code changes that make the signature hero canonical
2. concise completion notes covering:
   - what was canonicalized
   - what split-path usage was retired
   - what legacy code was intentionally retained and why
   - any residual ambiguity left for later phases

## Validation

You are not done until you can show, from repo truth:
- the reference homepage composition uses `HbSignatureHero`
- the split path is no longer the homepage flagship pattern
- the hero manifest still supports full-width/full-bleed usage where required
