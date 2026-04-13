# 04 — Target Architecture and Mode Model

## Recommended architecture

## 1. Mode resolver

Create a dedicated mode resolver, for example:

- `homepage/helpers/signatureHeroMode.ts`

Suggested behavior:

- If site URL is HBCentral → `homepage`
- Else if article inputs are materially present → `article`
- Else → safe empty/authoring state, not silent fallback drift

### Locked rule
HBCentral always resolves to homepage mode.

---

## 2. Explicit contracts

Create a neutral contract file, for example:

- `homepage/webparts/signatureHeroContracts.ts`

### Homepage model
A minimal locked model for the current flagship homepage branch.

### Article model
A dedicated article model, for example:

```ts
interface SignatureHeroArticleAuthor {
  displayName: string;
  upn?: string;
  photoUrl?: string;
  roleLabel?: string;
}

interface SignatureHeroArticleModel {
  title: string;
  subheading?: string;
  primaryImage?: {
    src: string;
    alt?: string;
  };
  author?: SignatureHeroArticleAuthor;
  publishedDate?: string;
  publishedTime?: string;
  labels?: string[];
  destinationLabel?: string;
}
```

---

## 3. Thin mode adapters

### Homepage adapter
- Preserve the current `HbSignatureHero` output exactly
- Optionally move the current implementation into:
  - `HbSignatureHeroHomepage.tsx`
- `HbSignatureHero.tsx` can then become the mode orchestrator

### Article adapter
- Add:
  - `HbSignatureHeroArticle.tsx`
- Build it on a shared lower-level surface seam
- Prefer a clean article composition over ad hoc homepage mutations

---

## 4. Shared lower-level rendering seam

Two acceptable answers:

### Option A — Reuse `HbcSignatureHeroSurface`
Good fit when article mode can be cleanly expressed through its slot model.

### Option B — Add a dedicated article surface under `@hbc/ui-kit/homepage`
Use this only if the existing shared surface forces awkward article compromises.

**Recommendation:** start with Option A, validate honestly, then promote only if article-specific pressure justifies a new shared primitive.

---

## 5. Author identity/photo seam

Create a neutral helper, for example:

- `homepage/helpers/articleAuthorIdentity.ts`

It should:
- accept explicit author data
- prefer explicit `photoUrl` when supplied
- otherwise resolve Graph photo from `author.upn`
- cache safely
- degrade to initials/no-photo fallback
- avoid any dependency on Kudos domain state

---

## 6. Runtime/property-pane integration

Extend the shell/runtime config path for article-mode fields.

Suggested property groups:

### Article Content
- title
- subheading
- destination label
- category / labels

### Article Media
- primary image URL
- primary image alt text

### Author
- author display name
- author UPN/email
- optional author role label
- optional explicit photo URL override

### Publish Metadata
- published date
- published time

### Homepage Background
- retain existing background override behavior for homepage branch

---

## 7. Validation model

### Must prove homepage stability
- HBCentral resolves to homepage mode
- current flagship output is visually unchanged
- no article furniture appears on HBCentral

### Must prove article behavior
- non-HBCentral renders article title/subheading/image/author/date/time/labels
- missing photo falls back cleanly
- missing optional metadata does not break layout
- reduced-motion and accessibility still hold

### Must prove architectural hygiene
- no direct coupling to Kudos runtime modules
- no stale code paths left behind
- no contradictory prop paths
- build/package/runtime validation passes
