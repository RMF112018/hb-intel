# HB Kudos Public Surface — UI-Only Remediation Matrix

| ID | Concern | Current Condition | Target Outcome | Governance / Quality Standard | Likely Impact Area |
|---|---|---|---|---|---|
| UI-01 | Top-level composition | Surface reads as stacked modules rather than one authored recognition feature | Public HB Kudos reads as one cohesive recognition product surface | Presentation-lane premium posture; stronger hierarchy and authored composition | `HbKudos.tsx`, shared homepage composition, possible ui-kit homepage surface work |
| UI-02 | Visual authority | Top band is too small and polite | Stronger masthead / top-band authority without fighting SharePoint host chrome | Homepage overlay: stronger scale, composition, brand presence | public webpart composition + surface family |
| UI-03 | Width and value density | Too tall for the value delivered; requires zoom reduction to read comfortably | Better information density and more confident use of width/height | Host-aware premium composition; zoom resilience | public surface layout |
| UI-04 | Container nesting | Too many nested cards/frames/labels | Fewer wrappers, stronger hierarchy, less decorative fragmentation | Structural rebuild over cosmetic polish | public surface + shared primitives |
| UI-05 | Featured recognition card | Too much framing, not enough content value | Featured recognition feels more direct, premium, and content-led | Stronger focal hierarchy | spotlight / hero integration |
| UI-06 | Archive zone | Archive is weak, awkward, and visually drops off too sharply | Archive / recent recognition becomes a clear but subordinate browse path | Better secondary-zone composition | archive block, search, browse cards |
| UI-07 | CTA hierarchy | Actions are repetitive and diluted | Clear primary, secondary, and contextual action hierarchy | Interaction clarity and authored rhythm | top band, featured item, composer footer |
| UI-08 | Copy framing density | Too many labels and structural callouts | Surface explains itself less and presents itself more | Cleaner scan order, stronger authored feel | labels, section headings, helper content |
| UI-09 | Composer length and rhythm | Composer is long, boxy, and workflow-like | Composer feels guided, compact, warm, and premium | Presentation quality within form flow | composer shell + internals |
| UI-10 | Composer intro content | Redundant intro block consumes valuable vertical space | Intro treatment is lighter or absorbed into stronger composer structure | Better task efficiency and value density | composer opening region |
| UI-11 | Recipient entry UX | Raw-feeling text entry does not feel premium or trustworthy | Recipient selection feels resolved, typed, and polished | Typed-recipient model should feel premium in UI, not only in code | composer recipient controls |
| UI-12 | Multi-bucket recipient clarity | Individuals/teams/departments/project groups are visually bulky and operational | Recipient buckets are clearer, lighter, and easier to use | Guided workflow without admin-panel feel | composer recipient section |
| UI-13 | Input styling | Inputs and helper copy are visually repetitive and too form-heavy | Inputs feel more refined and intentional | Stronger form hierarchy and reduction of generic box stacks | composer fields |
| UI-14 | Mobile / narrow-width behavior | Bottom action area and floating utility behavior conflict visually | Clean action area with no overlap or obstruction | Responsive integrity and action safety | composer footer / floating utility interactions |
| UI-15 | Accessibility / focus | Premium intent exists but interaction quality is not yet proven strong enough | Visible focus, better keyboard rhythm, safer overlay behavior | Homepage/SPFx accessibility requirements | composer, flyouts, buttons, inputs |
| UI-16 | Search / browse utility quality | Archive search looks undersized and incidental | Browse/search utility is intentional and better integrated | Better subordinate utility composition | archive/search region |
| UI-17 | Surface coherence with People & Culture lane | Public Kudos still feels partially assembled from parts | Stronger cohesion with a clear recognition-specific surface logic | Surface-family clarity | public surface + ui-kit homepage family |
| UI-18 | Hardcoded local premium styling | Too much visual logic appears to live in local styling | Durable patterns are promoted/shared where warranted; local drift reduced | Strict ui-kit/homepage governance | shared primitives, ui-kit homepage |
| UI-19 | Shared-surface promotion discipline | Some patterns likely deserve promotion, others should remain local | Correct boundary decisions, documented by the agent | Package/layer discipline | `apps/hb-webparts` vs `packages/ui-kit` |
| UI-20 | Final rendered premium quality | Surface is improved but not yet signature-grade | Public HB Kudos clears a credible flagship-quality bar for a homepage recognition feature | Final doctrine closure | full public HB Kudos surface |

## Closure Standard

A matrix row is only closed when the agent can show:

- code changes
- rendered outcome improvement
- doctrine alignment
- no obvious regression in SharePoint-hosted behavior

