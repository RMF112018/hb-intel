# 03 — Decision Lock

## D-01 — HBCentral homepage mode is locked

If the current site URL resolves to:

`https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

the webpart must render the current homepage flagship hero behavior.

No editor setting may override this.

---

## D-02 — Homepage and article are separate behavior families

The solution must have two behavior families:

1. **Homepage flagship mode**
2. **Article mode**

These may share lower-level seams, but they must not be treated as one loosely optional prop matrix.

---

## D-03 — The homepage branch keeps the current flagship content lock

Homepage mode keeps:

- personalized greeting
- “Build with GRIT.”
- company logo / brand lockup

Homepage mode does **not** absorb:

- article title
- article subheading
- author row
- metadata strip
- date/time row
- destination labels

---

## D-04 — Article mode uses an explicit view model

Article mode must use an explicit contract, not a scattering of opportunistic optional props.

Recommended shape:

- `title`
- `subheading`
- `primaryImage`
- `author`
- `publishedDate`
- `publishedTime`
- `labels`

---

## D-05 — Host is inferred; article content is explicit

### Host-inferred
- current site URL
- HBCentral lock
- mode resolution branch

### Explicitly configured / supplied
- article title
- article subheading
- image
- author display information
- author UPN/email
- publish date/time
- labels / destination metadata

---

## D-06 — Shared identity/photo mechanics are reusable; Kudos runtime is not

Approved reuse direction:
- `PersonEntry`
- Graph photo function
- photo cache mechanics
- people search adapter

Not approved:
- importing the article hero from Kudos runtime code
- coupling hero render logic to Kudos domain models
- pulling feed/composer/runtime behavior into article rendering

---

## D-07 — Same webpart ID may remain, but the runtime contract must harden

It is acceptable to keep the same SPFx webpart identity if:
- HBCentral remains locked to homepage mode
- article mode is isolated cleanly
- runtime/property-pane inputs are explicit and stable
- validation covers both behavior families

---

## D-08 — This is a structural redesign, not a full replacement

The current homepage hero is not being thrown away.
It is being preserved and put behind a stricter mode boundary.

The redesign work is about:
- mode isolation
- article-mode introduction
- shared seam hygiene
- runtime safety
