# 02 — Decision Lock

Using the completed baseline from the previous prompt, produce a **Decision Lock** for the Hero Banner Admin effort.

## Mandatory operating instruction

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

## Strict doctrine rule

The decision lock must state plainly that strict compliance with:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

is mandatory and non-negotiable.

## Locked host relationship to include

The decision lock must explicitly preserve:

- **Admin hosting page:** `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/SitePages/Homepage-Admin.aspx`
- **Controlled public homepage:** `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

## Required decisions

Lock all of the following before implementation begins:

### 1. Public-surface scope lock
State exactly what the public Hero Banner will support after this effort.

At minimum evaluate:
- headline / banner title
- message / subtext
- eyebrow
- metadata
- CTA
- secondary CTA
- background image
- fallback behavior when config is absent
- relation to property-pane fallback vs hosted config

### 2. Admin-app scope lock
State exactly what the Hero Banner Admin app owns.

At minimum decide:
- that it is a dedicated SPFx admin surface hosted on `.../SitePages/Homepage-Admin.aspx`
- that it controls the public Hero Banner on `.../sites/HBCentral`
- whether it writes to a canonical SharePoint list
- whether it supports preview
- whether it supports draft/live state or single live record only
- whether image input is URL-only or library-backed
- whether it supports one active record only

### 3. Config-source lock
Decide the canonical source of truth for hosted runtime.

Strong default:
- canonical SharePoint list-backed config read in hosted runtime
- manifest/property-pane fallback only for local/dev/no-SPFx conditions

### 4. Greeting logic lock
Lock the greeting windows exactly as follows:

- `03:00:00`–`11:59:59` → `Good morning`
- `12:00:00`–`17:00:59` → `Good afternoon`
- `17:01:00`–`02:59:59` → `Good evening`

Also lock:
- system-time basis
- deterministic tests around edge minutes
- no hidden timezone math unless current repo truth already requires it

### 5. Persona lock
Explicitly lock:
- public Hero Banner persona
- admin app persona
- what must remain common with the broader HB homepage family
- what must remain unique so the result does not become Kudos-like sameness

### 6. Doctrine-compliance lock
State the explicit doctrine obligations that the implementation may not violate.

### 7. Validation lock
Define the minimum proof required for closure.

Must include:
- hosted screenshot proof
- runtime console review
- config write → read-through proof
- greeting-boundary proof
- proof that the admin page controls the public homepage hero
- conformance scorecard
- closure checklist

## Hard rules

- Do not implement in this prompt.
- Do not leave decisions implied.
- Do not allow “we’ll decide during coding.”
- Do not let property-pane config remain the de facto production CMS unless baseline evidence proves that is the right answer.

## Required deliverable

Produce a markdown file with these exact sections:

1. Scope Lock
2. Host and Control Lock
3. Source-of-Truth Lock
4. Greeting Logic Lock
5. Persona Lock
6. Doctrine-Compliance Lock
7. Validation Lock
8. Accepted Exceptions
9. Non-Negotiable Rules for Implementation
