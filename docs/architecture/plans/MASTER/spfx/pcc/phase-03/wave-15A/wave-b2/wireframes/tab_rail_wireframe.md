# Tab Rail Wireframe

## Target Tab Rail

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  Project Home   Team   Documents   Project Readiness   Approvals   External Platforms  │
│  ═══════════                                                                            │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Active State

```text
Project Home
────────────
```

Required active signals:

- stronger text weight / color;
- subtle active background or container;
- branded animated underline/bar;
- focus ring when keyboard-focused.

## No Icons

Do not render icons in the tab rail.

## Overflow

On constrained widths:

```text
┌──────────────────────────────────────┐
│ Project Home  Team  Documents  ... → │
└──────────────────────────────────────┘
```

- horizontal scroll is acceptable;
- active tab must remain visually obvious;
- no hamburger fallback in this remediation.
