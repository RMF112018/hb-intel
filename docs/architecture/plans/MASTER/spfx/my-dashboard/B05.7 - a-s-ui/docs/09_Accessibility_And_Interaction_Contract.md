# 09 — Accessibility and Interaction Contract

## Objective

Upgrade the Adobe Sign card from baseline semantic adequacy to **flagship-grade, explicit, tested accessibility behavior**.

## Stable Heading Requirement

The card heading must be:

```text
Agreement Activity
```

and must remain:

- noninteractive;
- the element referenced by the card article's `aria-labelledby`;
- stable across Action Queue and Completed views.

Do not embed interactive controls inside the heading.

## View Switch Semantics

### Required pattern

Use a manual-activation tab pattern:

```text
role="tablist"
role="tab"
role="tabpanel"
```

### Container

```text
aria-label="Adobe Sign activity views"
```

### Tabs

Each tab must have:

- stable id;
- `aria-selected`;
- roving `tabIndex`;
- `aria-controls` targeting the associated tabpanel.

### Panels

Each view panel must have:

- stable id;
- `role="tabpanel"`;
- `aria-labelledby` matching the active tab.

## Keyboard Behavior

### Required keys

| Key | Behavior |
|---|---|
| Tab | Enters the active tab in normal focus order |
| ArrowRight | Moves focus to next tab |
| ArrowLeft | Moves focus to previous tab |
| Home | Moves focus to first tab |
| End | Moves focus to last tab |
| Enter | Activates focused tab |
| Space | Activates focused tab |

## Activation Rule

Use **manual activation**:

- Arrow keys change focus only.
- Enter/Space activates the focused tab.
- This avoids lazy-loading Completed history just because focus moved.

## Focus Management

After activation:

- focus remains on the activated tab;
- do not jump focus into the panel automatically;
- panel content becomes available through subsequent normal tab order.

## Loading and Error Announcements

### Completed loading

The loading state must expose a polite status message:

```text
role="status"
aria-live="polite"
```

### Connect failure

Preserve:

```text
role="alert"
```

for failed Connect Adobe Sign CTA attempts.

### Completed retry failure/degraded copy

Use clear static content. If a fresh fetch attempt fails after a user presses Retry, a polite status treatment is acceptable; do not create aggressive repeated alerts.

## Touch Target Requirements

Target minimums for this card:

- Connect CTA: minimum 44px height.
- Retry CTA: minimum 36px height; 44px preferred if composition allows.
- View switch tabs: minimum 36px height.
- Open row action: minimum 32px height and generous horizontal padding.

## Focus-Visible Requirement

Every interactive control must have visible focus treatment:

- Connect CTA
- Retry CTA
- view-switch tabs
- Open row actions

Do not rely on browser defaults alone if existing module styling suppresses or weakens them.

## Hover Dependency Rule

No essential meaning may depend on hover:

- view state must be obvious without hover;
- Open actions must be visible without hover;
- state panels must be complete without hover.

## Row Action Semantics

Use actual anchors for `sourceOpenUrl`:

```html
<a href="..." target="_blank" rel="noopener noreferrer">Open</a>
```

Do not replace a truthful link with a fake button.

## Reduced Motion

If subtle transitions are used:

- respect `prefers-reduced-motion`;
- ensure transition removal does not hide content or break state clarity.

## Required Test Coverage

The final test suite must prove:

- article `aria-labelledby` points at stable noninteractive heading;
- tablist/tab/tabpanel relationships exist;
- ArrowLeft/ArrowRight/Home/End focus movement works;
- Enter/Space activate tabs without synthetic click scaffolding;
- Completed lazy fetch still occurs only on activation;
- Retry reissues the completed request;
- row Open links remain anchors with safe target/rel values;
- connect failure still yields alert semantics.
