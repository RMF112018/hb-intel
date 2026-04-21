# Prompt-02-Recent-Empty-State-and-Light-Data-Storytelling

## Objective
Create a persuasive, homepage-grade state for hbKudos when recent recognition is absent or sparse.

## Inspect exactly
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/usePublicKudosData.ts`
- any nearby data-shaping helper used to derive featured vs recent

## Current problem
If recent entries do not render, the product drops straight from featured recognition into archive emphasis. That makes the module feel past-tense and structurally thin.

## Required implementation outcome
Introduce an explicit light-data state that keeps the homepage story current and intentional. Examples:
- “No new recognition this week” with a human, on-brand explanation
- a compact activity summary
- a prompt that encourages participation without feeling needy

This is not a generic empty state. It must preserve premium tone and homepage usefulness.

## Proof of closure
Provide the new rendered state and explain how it behaves when:
- featured exists + recent absent
- featured absent + archive exists
- featured absent + archive absent
