# Research Findings — Why Company Pulse Should Be an Access Point, Not a Parallel Reader

## 1. Foleon is the content system of record

Foleon positions its platform as a content creation platform for high-impact digital documents and microsites, with centralized governance, brand controls, templates, workspace controls, and publishing operations. The implication for HB Central is direct: Marketing should author, sequence, design, and publish the experience in Foleon, not in the HB Homepage lane.

Source notes:
- Foleon describes centralized governance, brand controls, collaboration, and content operations as core platform capabilities.
- Foleon Content Builder is template-driven and intended to let teams build responsive, branded documents without custom code.
- Foleon Docs can be embedded so the main website does not need redeployment when content changes.

## 2. The homepage lane should act like a launch/spotlight surface

Microsoft's intranet/news patterns support this distinction:
- SharePoint News offers layouts like Top story, Side-by-side, Hub news, Carousel, and Tiles. These are entry surfaces to posts, not replacements for the post content.
- Viva Connections uses news cards that open into an immersive reader experience. That is directly analogous to HB Central using a card-like launch surface that opens the full-window Foleon viewer.

## 3. Use card/action guidance carefully

Fluent 2 card guidance supports cards as entry points, but interaction should be clear:
- A card should not contain ambiguous nested actions.
- If the card's job is to open one destination, the full-surface click target with one accessible control is appropriate.
- Supporting metadata must not compete with the primary action.

## 4. Foleon iframe guidance reinforces full-window containment

Foleon's iframe guidance notes that embedding keeps visitors on the host site and avoids redeploying the host website when Foleon content changes, but also introduces height, origin, and security considerations. HB's existing full-window viewer and origin policy are therefore the correct containment strategy.

## Design conclusion

Company Pulse should not become an internal Apple News clone. It should become the Company Pulse equivalent of the already reworked Project Spotlight:

> a polished, editorial launch card that previews the value of the current Foleon edition and opens the governed full-window Foleon viewer.
