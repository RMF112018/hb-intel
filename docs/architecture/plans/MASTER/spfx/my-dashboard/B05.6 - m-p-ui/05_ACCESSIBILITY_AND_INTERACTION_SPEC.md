# 05 — Accessibility and Interaction Specification  
## Menu, modal browser, search, keyboard, focus, and unavailable-action behavior

---

## 1. Interaction objective

The final My Projects module must be easy to use with:
- mouse;
- keyboard;
- touch;
- constrained windows;
- SharePoint-hosted chrome present.

No primary action may depend on hover.

---

## 2. Launch menu trigger

Each tile renders an explicit button:

- visible text: `Open`
- icon: chevron or launch-context icon where useful
- `aria-haspopup="menu"`
- `aria-expanded="true|false"`
- accessible label example:
  - `Open launch options for Alton Hilltop at PBG`

---

## 3. Launch menu behavior

### Open
- `Enter` or `Space` on trigger opens menu.
- Focus moves to the first enabled menu option.

### Navigate
- `ArrowDown` and `ArrowUp` traverse menu options.
- `Home` / `End` behavior may be implemented if consistent with the chosen menu pattern.

### Close
- `Escape` closes menu and returns focus to the originating trigger.
- Outside click closes menu.
- Choosing an available action closes the menu after navigation is activated.

### Concurrency
- Only one launch menu may be open at a time in the card/browser surface.

---

## 4. Launch menu item semantics

### Available SharePoint / Procore destinations
- render as real anchors;
- preserve:
  - `target="_blank"`
  - `rel="noopener noreferrer"`.

### Unavailable destinations
- must not render fake anchor tags;
- may render as:
  - disabled menu item button;
  - non-interactive descriptive row;
- must retain an accessible explanation.

Use tooltip or compact explanatory copy when the unavailable reason needs clarification.

---

## 5. Portfolio browser overlay semantics

### Required semantics

- modal overlay;
- `role="dialog"` or equivalent accessible modal dialog semantics;
- `aria-modal="true"`;
- title wired by `aria-labelledby`;
- close control with explicit label;
- Escape closes;
- background page interaction is suppressed while open;
- focus returns to the `View all projects` trigger after close.

### Initial focus
- initial focus should land on the search input when the browser opens.

### Scroll
- result body uses governed scroll behavior;
- header/search/close remain reachable.

---

## 6. Search accessibility

- visible input label or appropriately associated screen-reader label;
- placeholder copy:
  - `Search by project name or number`;
- search results update deterministically;
- no-results text:
  - `No projects match your search.`

---

## 7. Role overflow interaction

- Role overflow control remains keyboard accessible.
- It must not cause layout instability in the resting tile.
- If using a popover/tooltip pattern, it must:
  - open via keyboard;
  - close via Escape/outside behavior where appropriate;
  - avoid clipping.

---

## 8. Focus-visible requirements

Focus-visible styling must be present for:

- `Open` trigger;
- menu options;
- close button;
- search input;
- `View all projects`;
- role overflow trigger;
- any disabled-state explanatory affordance that remains interactive.

---

## 9. Reduced motion

Motion must respect reduced-motion preference:

- tile reveal/hover/press motion;
- menu open/close motion;
- portfolio browser entrance/exit motion.

Reduced-motion mode should keep state changes clear without transform-heavy animation.

---

## 10. Touch target posture

Interactive controls must remain credible in touch-sized layouts:

- Open trigger;
- menu options;
- close control;
- search input;
- view-all button.

Do not shrink primary controls below usable tap size to satisfy density.

---

## 11. DOM hooks recommended for tests

- `data-my-projects-launch-trigger`
- `data-my-projects-launch-menu`
- `data-my-projects-launch-option="sharepoint"`
- `data-my-projects-launch-option="procore"`
- `data-my-projects-portfolio-browser`
- `data-my-projects-portfolio-search`
- `data-my-projects-search-empty`
- `data-my-projects-browser-close`
