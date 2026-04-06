# Prompt 02 — Rebuild the Signature Hero Visual System Into a Minimal Premium Identity Surface

## Objective

Execute a sweeping UI refinement of the canonical `HbSignatureHero` so it becomes a **minimal, premium, identity-led flagship surface**.

The hero must contain **only**:
- the company logo
- the tagline: **Build with GRIT.**
- the personalized welcome message

Nothing else.

## Important Working Rule

**Do not re-read files that are already in your active context window or current working memory.**
Only reopen files when needed to validate implementation details before editing.

## Required Outcome

The hero should feel:
- premium
- quiet
- current
- confident
- architectural
- established
- intentional
- materially more sophisticated than the current implementation

It should **not** feel:
- empty
- generic
- gradient-heavy
- “tech demo”
- old-school corporate banner
- stodgy
- over-authored
- overloaded with utility clutter

## Mandatory Content Reduction

Remove from the hero:
- eyebrow
- editorial headline
- editorial supporting copy
- CTA primary
- CTA secondary
- metadata row
- alert chip
- context line
- extra badges
- extra status affordances
- any secondary hero furniture not required for the three locked content elements

The hero must preserve a strong flagship presence using:
- composition
- scale
- spacing
- type
- art direction
- depth
- materiality
- motion restraint

—not extra content.

## Required Design Direction

### 1. Composition
Design the hero as a premium full-width identity surface with:
- stronger negative space
- clearer asymmetry or intentional balance
- a more refined left/right or anchored composition
- typography-led authority
- breathing room without deadness

### 2. Typography
The hierarchy should read in this order:
1. logo / brand lockup
2. tagline: **Build with GRIT.**
3. personalized welcome message

The tagline should feel authored and brand-defining, not like a small helper label.

The personalized greeting should feel human and warm, but still premium and disciplined.

### 3. Motion
Use restrained premium motion only where it materially helps.
Allow:
- subtle reveal choreography
- refined opacity / translate motion
- premium hover polish if any interactive element remains

Disallow:
- flashy motion
- theatrical animation
- unnecessary movement in a minimal hero

### 4. Styling discipline
Reduce inline visual literals where practical.
Move visual rules into the most appropriate governed styling mechanism already used by the hero path.

## Stack Expectations

Use the approved homepage stack where relevant:
- `motion`
- `lucide-react` only if truly needed (do not force icons into the reduced hero if they are unnecessary)
- `class-variance-authority`
- `clsx`

Do not add decorative elements just to “use the stack.”

## Hard Rules

- The hero may contain only the three locked content elements.
- The result must still feel flagship and premium.
- Do not reintroduce clutter through decorative substitutes.
- Do not quietly keep hidden or visually minimized removed content around in the DOM unless truly necessary.
- Do not let the hero collapse into a bland text block on a large canvas.

## Deliverables

Produce:
1. the rebuilt hero UI
2. concise completion notes describing:
   - what content was removed
   - how flagship presence was preserved despite simplification
   - key compositional changes
