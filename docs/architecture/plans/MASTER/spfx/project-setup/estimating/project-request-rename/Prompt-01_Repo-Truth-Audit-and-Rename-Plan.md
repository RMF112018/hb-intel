# Prompt 01 — Repo-truth audit and rename plan

You are working in the authoritative implementation repository for HB Intel:

`https://github.com/RMF112018/hb-intel.git`

## Objective

Conduct a repo-truth audit and produce a precise implementation plan to rename the current SPFx app currently treated as the “Estimating” SPFx app into **Project Setup Requests**.

## Critical intent

- The current Project Setup SPFx app should no longer be defined, documented, packaged, or referenced as the Estimating app.
- This rename is part of a broader architectural separation:
  - **Project Setup Requests** becomes its own distinct app/package/surface.
  - A future **Estimating** SPFx app will exist separately.
- The rename effort must include the app/package identity that will be reflected in the final `.sppkg`, including manifest/package metadata and the app ID/GUIDs if they are part of the shipped package identity and should change for clean separation.

## Critical instructions

- Treat live repo truth as authoritative.
- Do not rely on prior assumptions.
- Do not re-read files that are already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not implement anything yet in this prompt.
- First audit and map the full rename blast radius.
- Distinguish clearly between:
  1. files that define runtime behavior
  2. files that define SPFx package identity
  3. files that define user-facing labels/names
  4. files that define docs/architecture/roadmap references
  5. files that define tests and release assets

## Required working approach

1. Identify the current SPFx app/package that is actually the Project Setup Requests surface.
2. Locate all references where this app is still named, implied, grouped, or documented as “Estimating”.
3. Identify all SPFx packaging artifacts that will need rename treatment, including at minimum:
   - package names
   - package descriptions
   - manifest titles/descriptions
   - webpart/app IDs or GUIDs if separation requires a new identity
   - package-solution metadata
   - solution names
   - display names shown in SharePoint/App Catalog
   - app icon / title references if present
   - release/build artifact references
4. Identify all repo docs that define this as the Estimating SPFx app or imply Project Setup is inside the Estimating SPFx app.
5. Identify all architecture maps and plan files that must be updated to reflect separation between:
   - Project Setup Requests app
   - future Estimating app
   - Accounting app
   - Admin app
   - shared provisioning/saga backbone
6. Identify all tests that assume the old naming or package identity.
7. Produce a rename plan that breaks the implementation into concrete execution groups.

## Required output

Produce a rigorous rename-impact report with:

1. Executive summary
2. Authoritative current app identity
3. Full rename blast-radius inventory
4. SPFx/package identity items that must change
5. Code/runtime naming items that must change
6. Docs/architecture items that must change
7. Test/build/release items that must change
8. Recommended implementation order
9. Explicit list of risky changes requiring extra caution
10. Explicit list of things that must NOT be changed

Do not implement changes yet.
