# Prompt 06 — `More Project Resources` Disclosure and Tile UI Integration

## Objective
Integrate custom links into the My Projects tile/card UI under the collapsed `More Project Resources` button/menu.

## Required implementation
- Add `More Project Resources` disclosure/menu to project tiles.
- Render:
  - custom links,
  - Shared / Only me badges,
  - Edit / Remove actions when permitted.
- Render empty state:
  - `No additional project resources have been added yet.`
- Render footer CTA:
  - `Add project link`
- Connect to modal from Prompt 05.
- Refresh or update card state after successful create/update/delete using the repo-appropriate deterministic pattern.
- Ensure view-all/browser tile reuse remains correct.

## Mandatory rules
1. Custom links do not join fixed system launch actions.
2. Exact label: `More Project Resources`.
3. Exact CTA: `Add project link`.
4. Preserve compact card posture and current responsive behavior.
5. Preserve accessibility:
   - aria-expanded
   - keyboard reachability
   - dialog focus management.

## Output format
Return:

# Prompt 06 Closeout — More Project Resources UI Integration
## 1. Executive Verdict
## 2. UI Behavior Implemented
## 3. Accessibility and Responsive Posture
## 4. Files Changed
## 5. Test Results
## 6. Remaining Work for Prompt 07
