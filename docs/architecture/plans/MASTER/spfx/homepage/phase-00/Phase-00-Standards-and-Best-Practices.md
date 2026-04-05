# Phase 00 Standards / Best Practices

## Objective
This file defines the standards and best-practice expectations that govern Phase 00 execution.

---

## 1. Repo Truth First
- Treat the live repo as the primary implementation truth.
- When docs and code disagree, do not preserve the disagreement for convenience.
- Resolve the contradiction directly and leave behind one authoritative statement.

---

## 2. Supported SharePoint Posture
- Preserve a supported SharePoint customization model.
- Distinguish clearly between:
  - page-canvas ownership
  - placeholder/shell-adjacent extensions
  - unsupported shell takeover patterns
- Do not leave room for later prompts to mistake premium styling ambition for unsupported shell control.

---

## 3. Entry-Point Discipline
- Package entry points must be intentional, documented, and enforced.
- Documentation must never describe entry points that are not actually part of the published contract.
- Homepage work must have a clearly defined import policy.
- If a constrained homepage surface exists, it must be real in both code and docs.

---

## 4. Documentation Governance
- Governing docs should be concise, direct, and authoritative.
- Avoid layered ambiguity where multiple documents partially describe the same rule differently.
- Prefer one authoritative file plus explicit references over several overlapping files.
- When replacing or downgrading a doc, add supersession language.

---

## 5. Quality Bar Protection
- Eliminating overly restrictive doctrine does **not** mean weakening the design or engineering bar.
- Preserve strong standards for:
  - accessibility
  - clarity
  - host awareness
  - maintainability
  - premium visual ambition
- Rewrite restrictive rules when necessary, but do not collapse them into vague guidance.

---

## 6. Narrow Scope Discipline
- Keep Phase 00 focused on contracts, doctrine, and authoritative boundaries.
- Do not expand into later-phase work unless a narrow supporting change is required to make Phase 00 real.
- If a later-phase issue is discovered, document it as a follow-on rather than silently broadening scope.

---

## 7. Minimal Necessary Change
- Make the smallest set of durable changes that resolves the contradiction completely.
- Prefer exact updates over sprawling refactors.
- If a doc structure change is required, make it deliberate and easy to understand.

---

## 8. Future-Agent Readability
- Write documentation so that a future code agent can follow it without inference-heavy interpretation.
- Replace soft language such as “may,” “might,” or “consider” when a rule is actually mandatory.
- Use direct statements for:
  - allowed imports
  - prohibited imports
  - authoritative paths
  - homepage vs shell boundaries
  - SPFx-hosted constraints

---

## 9. Verification Standard
Before closing any prompt in this package, verify:

- that updated docs match the real package surface
- that references point to valid current files
- that no stale guidance remains nearby that would create renewed ambiguity
- that the resulting guidance is strong enough to support the next phase without reopening the same issue

---

## 10. Required Tone
All resulting documentation should read as:

- professional
- direct
- architecture-aware
- host-aware
- implementation-oriented
- protective of premium quality
- not hedged or tentative where certainty is available
