# Phase 01 Risk Exposure

## Purpose

This file highlights the main risks the local code agent must actively watch while executing Phase 01.

---

## 1. Homepage / shell boundary regression

### Risk

Homepage work drifts into shell-extension responsibilities.

### Examples

- nav chrome added to homepage webparts
- footer or top-ribbon behavior implemented inside the page canvas
- host chrome assumptions creeping into homepage components

### Response

Reject the change. Keep page-canvas product work separate from shell-extension work.

---

## 2. Product-stabilization phase becomes a redesign phase

### Risk
n
The agent tries to solve Phase 02 visual ambition inside Phase 01.

### Examples

- broad styling rewrites
- unnecessary motion work
- major brand-expression passes without contract stabilization

### Response

Do not do it. Phase 01 is about boundary, contracts, authoring safety, and product clarity.

---

## 3. Contract clarity gets replaced with abstraction churn

### Risk

Helpers, models, and contracts get reorganized heavily without making ownership clearer.

### Response

Prefer explicit ownership and light rationalization over “frameworking” the homepage lane.

---

## 4. Reference composition confusion remains unresolved

### Risk

`ReferenceHomepageComposition` remains ambiguously positioned between demo, fallback, and product behavior.

### Response

Document its purpose explicitly. Protect it if it is useful. Remove it only if repo truth strongly justifies it and the replacement is cleaner.

---

## 5. Mount / dispatch seam gets treated as incidental

### Risk

The mount seam is modified casually and later breaks packaged behavior.

### Response

Treat `src/mount.tsx` as a load-bearing product seam. Document it, test it where practical, and avoid churn without a strong reason.

---

## 6. Authoring-safe states remain under-specified

### Risk

Webparts look correct only when fully configured.

### Response

Phase 01 must explicitly protect:

- minimally configured states
- partially configured states
- invalid config states
- empty/no-data states
- loading states
- no-results states where relevant

---

## 7. Import-discipline drift

### Risk

Someone broadens homepage imports beyond `@hbc/ui-kit/homepage` / `theme` / `icons`.

### Response

Do not weaken the current ESLint and doctrine guardrails. Any legitimate need should be resolved by expanding `@hbc/ui-kit/homepage`, not bypassing it.

---

## 8. False completion

### Risk

The agent reports Phase 01 complete without real tests, acceptance notes, or explicit evidence.

### Response

Do not do that. Prompt 04 must leave a real evidence trail and a clean Phase 02 handoff.
