# 02 — List-by-List Architecture

## Overview

The recommended list architecture uses one authoritative master list and several child/configuration lists.

## List inventory

1. `HB Articles`
2. `HB Article Team Members`
3. `HB Article Media`
4. `HB Article Template Registry`
5. `HB Article Destination Pages`
6. `HB Article Promotion Rules` (optional MVP, recommended)
7. `HB Article Workflow History` (optional MVP, recommended)
8. `HB Article Publishing Errors` (optional but strongly recommended)

---

## 1) HB Articles

### Purpose
Primary authoritative article record.

### Cardinality
- one row per article

### Owns
- article identity
- destination
- content type
- headline/subhead/summary/body
- hero-driving values
- lifecycle/workflow state
- promotion/feed flags
- page binding reference pointers
- template resolution inputs
- destination-specific metadata

### Notes
This is the core control-plane list and should be treated as the main system of record.

---

## 2) HB Article Team Members

### Purpose
Stores team-member rows related to an article.

### Cardinality
- zero to many rows per article

### Owns
- article-to-person relationship
- display order
- role labeling
- grouping/hierarchy metadata
- future org-chart structure inputs

### Notes
Required for `ProjectSpotlight` article families and optionally reusable elsewhere.

---

## 3) HB Article Media

### Purpose
Stores supporting media rows related to an article.

### Cardinality
- zero to many rows per article

### Owns
- gallery images
- captions
- alt text
- ordering
- future media grouping

### Notes
Secondary image can either live on `HB Articles` directly or also be represented here with a `mediaRole`. MVP should keep the primary/secondary fields on `HB Articles` and use this list for gallery assets.

---

## 4) HB Article Template Registry

### Purpose
Defines all template families, rules, required fields, visible blocks, and validation profiles.

### Cardinality
- one row per template profile

### Owns
- template key
- destination applicability
- content-type applicability
- display-block profile
- webpart profile bindings
- validation profile
- template status/version

### Notes
This is the authoritative registry for render composition behavior. Template logic should not be scattered in code.

---

## 5) HB Article Destination Pages

### Purpose
Tracks destination page bindings and sync state.

### Cardinality
- generally one row per article-page binding
- supports future rebind/version scenarios

### Owns
- articleId to pageId linkage
- target site
- page URL
- page template key
- shell version
- sync timestamps/status
- publish results

### Notes
Keeps page-binding state explicit rather than hidden in the article record alone.

---

## 6) HB Article Promotion Rules

### Purpose
Optional configuration layer for feed, featured, pinned, and rollup behavior.

### Cardinality
- one rule row per scope/type combination, or simplified into system config as needed

### Owns
- destination-scoped promotion defaults
- feed window defaults
- featured-slot rules
- manual override policies

### Notes
MVP can inline most promotion state directly on `HB Articles`, but this list is recommended once rule complexity grows.

---

## 7) HB Article Workflow History

### Purpose
Audit trail of article lifecycle changes.

### Cardinality
- many rows per article

### Owns
- state transitions
- actor
- timestamp
- note/reason
- approval decision records

### Notes
Recommended for governance and supportability.

---

## 8) HB Article Publishing Errors

### Purpose
Operational log for failed page sync/publish actions.

### Cardinality
- zero to many rows per article

### Owns
- articleId
- page binding id if available
- destination
- operation
- error summary
- retry status
- last attempted timestamp

### Notes
Strongly recommended for troubleshooting and controlled recovery.
