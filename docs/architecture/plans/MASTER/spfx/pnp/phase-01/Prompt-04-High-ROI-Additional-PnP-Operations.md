# Prompt 04 — High-ROI Additional PnP Operations

Use the local repo at HEAD as the final authority.

## Objective

Add a small second set of repeatable, high-ROI PnP/SharePoint operations that fit naturally into the same SPFx admin utility without turning it into an unfocused admin platform.

## Selection rule

Only include operations that are:

- read-heavy or safe-inspection oriented,
- repeatable,
- broadly useful across multiple sites,
- and realistic to surface as downloadable outputs.

## Recommended candidates

Evaluate repo fit and implement the best additional actions from this set:

1. **Library folder tree export**
   - export folder/subfolder structure for a selected document library

2. **Site groups / membership summary export**
   - export owners/members/visitors or equivalent site-group summary where accessible

3. **Navigation/export summary**
   - quick launch / top navigation structure where applicable

4. **Page webpart manifest inventory**
   - map client-side webparts used across modern pages

5. **List/library inventory with key settings**
   - deeper site inventory variant if the first-wave inventory is intentionally thin

## Scope discipline

Do not add operations that:

- mutate site structure,
- require broad destructive permissions,
- or introduce heavy backend complexity that is disproportionate to v1 value.

If a candidate is worthwhile but should remain deferred, document it explicitly instead of half-implementing it.

## Deliverables

Implement:

1. the selected additional actions,
2. any required UI catalog extensions,
3. output artifact generation for each action,
4. and a short note explaining why each chosen action belongs in v1 or v1.1.

## Final response requirements

Report:

- additional actions implemented,
- why they were chosen,
- their output files,
- and what was deliberately deferred.
