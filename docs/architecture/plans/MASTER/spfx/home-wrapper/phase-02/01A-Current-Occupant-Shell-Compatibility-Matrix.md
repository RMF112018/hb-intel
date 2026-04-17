# 01A — Current Occupant Shell Compatibility Matrix

This matrix exists to keep child-surface discussion bounded to shell compatibility.

It is now also aligned to `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`, which means the matrix must speak not only to generic shell fit, but specifically to:

- first-lane eligibility
- narrowest stable paired width expectations
- whether an occupant can survive compact / demoted entry states
- whether an occupant must stack on portrait and handheld breakpoints

## Current active occupants

| Occupant | Current fit | First-lane eligibility | Width / density posture | Likely shell risks | Shell accommodations required |
|---|---|---|---|---|---|
| `CompanyPulse` | Strong | Eligible as a dominant first-lane anchor | High-authority editorial surface with meaningful internal layout depth | Can compete visually with another dominant anchor; should not be treated as an equal-weight neutral card | Give explicit prominence rules; allow first-lane dominance; prevent casual pairing with another dominant anchor below comfort width |
| `LeadershipMessage` | Good | Eligible mainly as a supporting first-lane companion or later contextual band occupant | Calmer editorial/context surface | Can become visually underpowered or overly isolated if the shell gives it a standalone dominant slot | Assign to a contextual/supporting band; allow pairing only where the dominant-left hierarchy remains clear |
| `ProjectPortfolioSpotlight` | Strong | Eligible as a dominant first-lane anchor | High-authority operational surface with strong featured-object behavior | Attention competition with `CompanyPulse`; can become cramped if forced into shallow paired slots | Give slot comfort rules and compatibility restrictions with other dominant occupants; preserve dominant-left behavior where paired |
| `PeopleCulturePublic` | Partial / weakest fit | Eligible only conditionally; should not be assumed safe as a narrow paired first-lane occupant without explicit shell-fit proof | Self-contained local surface with internal `maxWidth: 1040` and many inline style decisions | Less adaptable to paired or compact shell placements; shell-fit variants are not explicit | Add capability metadata, first-lane restrictions, narrowest stable mode rules, and bounded shell-fit adjustments; do **not** turn this into a broad standalone redesign brief |
| `HbKudos` | Strong | Usually better as a governed supporting or later recognition-role occupant than as a dominant first-lane anchor | Persistent engagement / recognition surface with richer interaction depth | Can become too visually heavy if promoted to the same prominence tier as primary editorial / operational anchors | Assign a bounded recognition role, clear prominence ceiling, and explicit compact / demoted behavior for narrower entry states |

## Known future candidate occupant

| Occupant | Current relation to shell | Entry-state risk if inserted ad hoc | Required shell preparation |
|---|---|---|---|
| `SafetyFieldExcellence` | Exists in repo but is not currently composed into `hbHomepage` | Appending it into the first lane or early stack without capability metadata would recreate fixed-stack drift and create uncertain narrow-state behavior | Add inactive capability metadata, slot eligibility, first-lane eligibility rules, comfort width thresholds, and preset placement guidance before any insertion decision |

## Compatibility conclusions

1. The current shell occupants are not the primary problem; the missing shell contract is.
2. `PeopleCulturePublic` is the current fit outlier, but the needed work is shell-fit compatibility, not a general product audit.
3. `CompanyPulse` and `ProjectPortfolioSpotlight` are both strong enough to cause attention conflict unless the shell mediates first-lane prominence and pairing.
4. `LeadershipMessage` is a viable contextual first-lane companion only if the dominant-left hierarchy remains clear at the relevant practical shell width.
5. `HbKudos` should remain persistent and visible, but inside a governed recognition role rather than a free-floating equal-weight section.
6. Any future addition such as `SafetyFieldExcellence` must enter through capability records and approved presets, not by manual JSX append.
