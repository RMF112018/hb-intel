# Prompt-06 — HB Kudos Public True People Picker Mandate

```md
Objective

Replace the current typed-entry People recipient experience in the public HB Kudos composer with a true people picker.

Primary problem

The current public Give Kudos flyout continues to use a typed-entry / email-address-style input path for the People bucket.

That is no longer acceptable.

The current interaction is not a sufficiently premium or trustworthy UX for a public-facing recognition flow, and prior prompt sequences have allowed the implementation to preserve `recipientsMode: 'typed'` behavior for People while only polishing layout and styling.

This prompt is for ending that fallback.

Non-negotiable outcome

The People bucket must no longer use freeform text or email-address entry as its primary UX.

The agent must implement a true people picker interaction for People.

A cleaner text field does not count as closure.

A better placeholder does not count as closure.

A typed field with delayed moderator resolution does not count as closure for People.

Critical Constraints

- Use live repo truth.
- Do not begin by re-reading files already in active context or memory.
- Maintain strict focus on the People recipient interaction in the public HB Kudos composer.
- Maintain strict compliance with `@hbc/ui-kit`, `docs/reference/ui-kit/`, homepage doctrine, and package-boundary discipline.
- Do not preserve the current People entry model out of architectural caution.
- The rendered user-facing outcome is the primary success measure.

Hard directives

1. The People bucket must be rebuilt from a typed-entry field into a true picker interaction.
2. The agent must not preserve `recipientsMode: 'typed'` for the People bucket if that is what keeps forcing string entry.
3. The new People interaction must support:
   - search
   - result selection
   - selected-person chips/tokens
   - removal of selected people
   - stable keyboard interaction
4. The agent may keep Teams / Departments / Projects on a different interaction model if appropriate, but People must become a true picker.
5. If the existing composer primitive cannot support that outcome, the agent must:
   - replace it,
   - split it,
   - or create/promote the necessary governed primitive in shared or UI-kit territory.
6. Do not stop at internal plumbing. The open-composer screenshot must visibly show a real picker experience.

Acceptable implementation directions

The agent may choose the best governed route based on repo truth, including:

- extending an existing shared composer primitive to support a real people picker path
- creating a dedicated People-picker sub-primitive for the composer
- introducing a SharePoint-aware or SPFx-aware people search/select adapter where justified
- splitting the current typed-recipient model so People uses a distinct interaction path
- promoting the necessary reusable picker behavior into `@hbc/ui-kit` if durable reuse and doctrine justify it
- keeping the picker local/shared if that is the more correct governed boundary

The agent is not required to preserve the current People-entry implementation path.

Required product outcome

After this prompt, the public Give Kudos composer must show a true People picker that reads as a modern application interaction, not a fallback text-entry field.

At minimum, the rendered outcome should make it obvious that the user can:

- search for a person
- select a real person result
- see selected people as chips/tokens
- remove or adjust selections
- proceed with confidence that People recipients are actual selected identities, not unresolved typed strings

Required deliverables

1. Implement the People-picker replacement.
2. Make any justified local/shared/UI-kit boundary changes needed to support it.
3. Provide a concise architectural note stating:
   - where the final picker lives
   - why that boundary is correct
   - whether the old typed People path was replaced, split, or removed
4. Provide updated evidence showing:
   - open composer state
   - visible true People picker interaction
   - at least one state with selected people rendered as chips/tokens
5. State plainly whether the current public composer still contains any typed-entry fallback for People. If yes, explain exactly why.

Acceptance standard

This prompt is successful only if the public HB Kudos composer no longer relies on typed-entry/email-style UX for the People bucket and instead presents a true people picker with visible search-select-token behavior.
```
