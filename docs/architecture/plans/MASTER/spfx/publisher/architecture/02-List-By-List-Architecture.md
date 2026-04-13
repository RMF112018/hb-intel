# 02 — List-by-List Architecture

## Overview

The recommended architecture uses one authoritative Project Spotlight post list, two variable-cardinality child lists, and supporting registry/binding/operations lists.

## List inventory

1. `Project Spotlight Posts`
2. `Project Spotlight Post Team Members`
3. `Project Spotlight Post Media`
4. `Project Spotlight Template Registry`
5. `Project Spotlight Page Bindings`
6. `Project Spotlight Workflow History` (recommended)
7. `Project Spotlight Publishing Errors` (recommended)
8. `Project Spotlight Rollup Rules` (optional, only if Project Spotlight landing logic becomes complex)

---

## 1) Project Spotlight Posts

### Purpose
Primary authoritative post record.

### Cardinality
- one row per post

### Owns
- post identity
- project metadata
- post family and spotlight classification
- title/subheading/summary/body
- banner-driving values
- workflow state
- Project Spotlight rollup flags
- template and shell resolution inputs
- current page-binding summary fields

### Notes
This is the main control-plane list and the system of record for editorial truth.

---

## 2) Project Spotlight Post Team Members

### Purpose
Stores team-member rows related to a Project Spotlight post.

### Cardinality
- zero to many rows per post

### Owns
- post-to-person relationships
- display order
- role / title labeling
- grouping metadata
- optional profile-drawer content inputs

### Notes
This list remains justified because team-member count is variable and the XML shell includes a dedicated `teamViewer` slot.

---

## 3) Project Spotlight Post Media

### Purpose
Stores gallery/media rows related to a Project Spotlight post.

### Cardinality
- zero to many rows per post

### Owns
- gallery image references
- captions
- alt text
- ordering
- future gallery grouping or role metadata

### Notes
This list remains justified because the canonical shell includes a gallery zone and gallery item count is variable.

---

## 4) Project Spotlight Template Registry

### Purpose
Defines all Project Spotlight template families, shell compatibility rules, required fields, visible blocks, renderer profile bindings, and validation profiles.

### Cardinality
- one row per template profile

### Owns
- template key
- page shell key
- shell source path
- post-family applicability
- spotlight-type applicability
- project-stage applicability
- block visibility profile
- renderer profile bindings
- validation profile bindings
- status/version

### Notes
Template logic should not be scattered through publish code.

---

## 5) Project Spotlight Page Bindings

### Purpose
Tracks page-generation and page-sync state for each published post.

### Cardinality
- generally one active binding per post
- supports future historical/replacement binding scenarios if shell regeneration needs a replacement page

### Owns
- post-to-page linkage
- target site
- page URL / page name / page id
- source shell path
- page shell key and version
- template key and version
- publish / republish operation history summary
- sync timestamps and sync status

### Notes
This keeps page binding explicit instead of hiding it only on the post row.

---

## 6) Project Spotlight Workflow History

### Purpose
Audit trail of workflow state changes and publish decisions.

### Cardinality
- many rows per post

### Owns
- state transitions
- actor
- timestamp
- notes / reasons
- approval decisions
- archive / withdraw events

---

## 7) Project Spotlight Publishing Errors

### Purpose
Operational log for failed generation, update, or sync actions.

### Cardinality
- zero to many rows per post

### Owns
- post id
- binding id if available
- operation
- shell/template version in play
- error summary
- error details
- retry state

---

## 8) Project Spotlight Rollup Rules (optional)

### Purpose
Optional configuration layer for Project Spotlight landing-page rollups.

### Cardinality
- one row per rollup scope/profile combination if needed

### Owns
- featured-slot policy
- pinning defaults
- archive visibility defaults
- landing-page inclusion defaults

### Notes
MVP can inline most rollup state on the post record. Introduce this only when the Project Spotlight landing logic becomes materially more complex.

## XML-template linkage posture

The architecture should store enough linkage to prove which shell generated the page.

At minimum, the system should know:

- which `PageShellKey` applied
- which source XML template/page path was used
- which template profile resolved
- which shell/template version created the current page
- whether the next republish is an in-place update or a full regeneration
