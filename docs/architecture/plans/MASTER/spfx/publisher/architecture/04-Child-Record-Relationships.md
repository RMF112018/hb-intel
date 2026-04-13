# 04 — Child-Record Relationships

## Purpose

This package preserves child records only where they remain justified by the Project Spotlight-only, XML-shell-driven model.

## Relationship summary

### Parent
- `Project Spotlight Posts`

### Child lists that remain necessary
1. `Project Spotlight Post Team Members`
2. `Project Spotlight Post Media`
3. `Project Spotlight Workflow History` (operational child/audit)
4. `Project Spotlight Publishing Errors` (operational child/log)

### Supporting configuration/binding lists
- `Project Spotlight Template Registry`
- `Project Spotlight Page Bindings`

## Why team-member child rows remain necessary

The canonical XML shell contains a dedicated custom `teamViewer` slot. Team-member count and order are variable, so these values should not be flattened into the post master row.

Keep child rows because they support:

- zero-to-many team members per post
- manual ordering
- optional grouping
- future hierarchy modes
- optional profile-drawer data
- independent row-level edits without rewriting the entire parent record

## Why media child rows remain necessary

The canonical XML shell contains a dedicated gallery zone. Gallery image count and order are variable, so media must remain a child relationship.

Keep child rows because they support:

- zero-to-many gallery images per post
- per-image alt text
- captions
- credits
- order control
- future media grouping

## Why body sections do **not** become child rows in MVP

The current XML shell already defines:

- one subheading text slot
- one primary body text slot

That means MVP body composition can remain on the parent post record as:

- `Subhead`
- `BodyRichText`

Create structured body child rows only if later shell variants introduce multiple repeatable narrative sections.

## Recommended relationship model

### 1. Post → Team members
- one post
- zero to many team-member rows
- team rows loaded by `PostId`

### 2. Post → Media rows
- one post
- zero to many media rows
- media rows loaded by `PostId`

### 3. Post → Page binding
- one post
- generally one active page binding
- future support for historical/replacement bindings is allowed

### 4. Post → Workflow history
- one post
- many workflow history rows

### 5. Post → Publishing errors
- one post
- zero to many error rows

## Example relationship map

```text
Project Spotlight Posts (1)
 ├── Project Spotlight Post Team Members (0..n)
 ├── Project Spotlight Post Media (0..n)
 ├── Project Spotlight Workflow History (0..n)
 ├── Project Spotlight Publishing Errors (0..n)
 └── Project Spotlight Page Bindings (0..1 active, 0..n historical if needed)

Project Spotlight Template Registry (1 template profile)
 └── referenced by Project Spotlight Posts.TemplateKey
     and Project Spotlight Page Bindings.TemplateKey
```

## Identity rules

1. `PostId` is the primary parent foreign key used by child rows
2. `TeamMemberId` and `MediaId` are durable child identities
3. `BindingId` is the durable page-binding identity
4. `TemplateKey` and `PageShellKey` are registry identities, not child-row identities

## Deletion / archive posture

### Team rows
- should normally be soft-managed through the parent post workflow
- hard deletion only by administrative action if governance allows

### Media rows
- same posture as team rows
- archive/hide is preferred over silent loss if a post is already published

### Binding rows
- should remain traceable even if the published page is withdrawn or replaced

## Future-proofing notes

Child-model expansion is justified only if a future shell introduces new variable-cardinality content zones such as:

- repeatable narrative sections
- milestone cards
- quote/callout groups
- mixed-media story blocks

Until then, the MVP child model should stay intentionally tight and match the actual XML shell.
