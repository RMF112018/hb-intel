# Prompt 01 — Forensic Runtime CSS Audit

## Objective

Perform a narrow forensic audit of the runtime CSS seam for the shared `hb-webparts` app.

The goal is to determine exactly why the rebuilt Signature Hero markup is rendering while the intended CSS styling is not taking effect in SharePoint.

This is not a hero redesign.
This is not a broad repo audit.
This is a runtime CSS truth audit.

## Required Inputs

Audit the current local branch state and the current generated package/runtime behavior, including at minimum:

- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css`
- CSS module generation / bundling output
- emitted CSS asset(s) for `hb-webparts`
- emitted JS bundle(s) for the shared webparts app
- shell-entry/runtime code responsible for loading shared assets
- browser/runtime evidence from SharePoint after deployment

Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.

## Required Tasks

### 1. Establish source truth
Document the intended styling outcomes from current source:
- dark charcoal surface
- constrained asymmetric content column
- reduced logo size
- large tagline
- subordinate greeting
- non-vanilla premium identity surface

### 2. Establish emitted artifact truth
Determine:
- whether the hero CSS module is emitted
- what CSS asset file contains those rules
- whether the CSS module class names are present in the emitted CSS
- whether the JS bundle references or expects that CSS asset

### 3. Establish browser/runtime truth
Use actual SharePoint runtime evidence to determine:
- whether the CSS asset is requested in the browser
- whether it loads successfully
- whether CSS rules for the hero classes are active in DevTools
- whether the runtime element has the expected generated classes
- whether those classes resolve to actual computed styles

### 4. Build a source-to-runtime mismatch table
Create a concise table showing:
- source style intent
- emitted asset reality
- browser load reality
- computed-style reality
- exact mismatch point

### 5. Name the break seam
Identify the specific seam causing failure, such as:
- CSS asset not emitted
- CSS asset emitted but not referenced
- shell-entry not loading CSS
- runtime asset URL wrong
- CSS asset blocked / 404
- CSS modules present but overridden or never attached

## Hard Gates

- Do not assume the CSS is loaded because the class names exist.
- Do not assume SharePoint is the problem without proving the asset load path.
- Do not proceed to fixes until you can name the exact source-to-runtime CSS seam.

## Deliverables

Produce:
- a short forensic audit note
- a mismatch table
- a named list of runtime CSS failure points
- a proposed fix order ranked by likelihood

## Validation

Before finishing, prove:
- whether the hero CSS asset is requested by the page
- whether the requested CSS returns successfully
- whether hero class rules are present in the browser's applied stylesheet set
