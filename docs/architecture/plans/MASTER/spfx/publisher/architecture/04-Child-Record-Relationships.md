# 04 — Child-Record Relationships

## Relationship model overview

The system uses a parent-child structure centered on `HB Articles`.

## Primary relationships

### 1. Article → Team Members
- Parent: `HB Articles`
- Child: `HB Article Team Members`
- Relationship key: `ArticleId`

#### Cardinality
- one article to zero–many team members

#### Purpose
- supply `teamViewer`
- preserve display order
- preserve role/group/hierarchy metadata

#### Notes
- For articles with no team members, `teamViewer` may be hidden automatically depending on template rules.

---

### 2. Article → Media
- Parent: `HB Articles`
- Child: `HB Article Media`
- Relationship key: `ArticleId`

#### Cardinality
- one article to zero–many media rows

#### Purpose
- supply image gallery
- support future media groupings
- preserve ordering and captions

#### Notes
- Hero image and secondary image live on the article master record in MVP because they are singular render anchors.
- Gallery media should live in child rows.

---

### 3. Article → Destination Page Binding
- Parent: `HB Articles`
- Child: `HB Article Destination Pages`
- Relationship key: `ArticleId`

#### Cardinality
- one article to one active destination binding in normal operation
- future support for historical bindings or multi-destination scenarios is possible

#### Purpose
- track destination page linkage
- track shell version and sync status
- track publish outcomes

---

### 4. Article → Workflow History
- Parent: `HB Articles`
- Child: `HB Article Workflow History`
- Relationship key: `ArticleId`

#### Cardinality
- one article to many workflow history rows

#### Purpose
- audit trail
- governance support
- support review and publish traceability

---

### 5. Article → Publishing Errors
- Parent: `HB Articles`
- Child: `HB Article Publishing Errors`
- Relationship key: `ArticleId`

#### Cardinality
- one article to zero–many error rows

#### Purpose
- support operational diagnostics and retry handling

## Template relationship

### Article → Template Registry
- Article field: `TemplateKey`
- Registry key: `TemplateKey`

#### Purpose
- resolve render composition rules
- determine required fields
- determine visible blocks
- determine webpart contract profiles

## Destination page shell relationship

### Destination Page Binding → Template Registry
- Binding field: `PageTemplateKey`
- Registry or shell registry field: `PageShellTemplateKey`

#### Purpose
- keep the applied shell explicit
- support page regeneration and version tracking

## Person / profile handling

### Team member rows
The `HB Article Team Members` list should store enough cached display information to render reliably, even if live profile calls are delayed or unavailable.

Recommended approach:
- store principal reference
- store display name
- allow role/group/hierarchy metadata
- resolve photo/profile information in the render layer or cache it later as needed

## Future relationships worth planning for

Not required for MVP, but keep room for them:
- Article → Related Links
- Article → Project Facts
- Article → Milestone Records
- Article → Related Articles
- Article → Distribution Targets

## Relationship integrity rules

1. No child record may exist without a valid `ArticleId`
2. Deleting or withdrawing an article should define how child rows are preserved or archived
3. Team/media ordering should always be explicit
4. Destination page bindings should be unique per active destination/article pairing
5. Template resolution should be explicit and not inferred only from the page shell
