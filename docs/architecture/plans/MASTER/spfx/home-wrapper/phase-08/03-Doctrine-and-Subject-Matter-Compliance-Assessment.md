# 03 — Doctrine and Subject-Matter Compliance Assessment

## Repo doctrine
### Governing standard
The repo’s SPFx governing doctrine is explicit that SPFx runs inside a host-controlled environment and therefore must optimize for host-aware polish, page-canvas excellence, elegant composition, strong utility value, authoring safety, and runtime resilience. It also explicitly calls out page-canvas ownership and width/compositional authority as load-bearing concerns. That means host-fit is not a cosmetic preference here; it is doctrine-level behavior. 

### Homepage overlay doctrine
The homepage overlay doctrine is equally explicit that homepage webparts own the page canvas and that hosted shell surfaces may share a row only when **actual slot width** supports a premium, stable nested layout. That lines up directly with the shell’s live responsibility boundaries and with the need to make width truth inspectable.

## Live repo alignment
### Directionally aligned today
The live repo is directionally aligned with doctrine in several ways:
- wrapper-vs-shell ownership is explicit
- the shell is container-aware in intent
- the shell already has a real entry-state model
- the shell already has a comfort/pairing model that attempts to honor actual slot width

### Not aligned enough yet
The live repo is not aligned enough where doctrine is most demanding:
- outer page-canvas authority is not singular enough
- the measurement seam is still too self-referential
- hosted-fit proof is too weak for a doctrine-level closure claim

## External subject-matter reinforcement
### Box model
By default, CSS `width` and `height` apply to an element’s **content box**, and padding/border are added on top of that unless `box-sizing: border-box` is used. That matters because a full-width element with inline padding can easily become harder to reason about at a hosted edge condition when the fit contract is not explicit.

### ResizeObserver
`ResizeObserver` can report changes to an element’s content box or border box. That means choosing what box you observe is an architectural decision, not a neutral implementation detail. In a host-aware shell, the measurement seam should reflect the declared fit authority, not just the nearest convenient element.

### Validation approach
Playwright’s device presets and viewport overrides are well-suited for validating desktop, tablet, and mobile hosted states. That makes them a practical tool for turning the shell’s breakpoint matrix into real proof rather than intuition.

## Compliance judgment
The live repo is close enough that the right move is not redesign but hardening:
- unify outer authority
- preserve deliberate inner-region styling
- rebase measurement on authoritative usable width
- add diagnostics and proof that align with doctrine
