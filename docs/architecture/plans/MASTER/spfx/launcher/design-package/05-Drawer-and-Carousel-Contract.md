# 05 — Drawer and Carousel Contract

## Drawer objective

The drawer must provide overflow access without degrading the launcher’s premium feel.

## Drawer structure

The drawer must be:

- bottom-sheet based
- visually clean
- materially wider than the current cramped implementation
- centered and proportioned well across desktop and tablet
- simple in structure

## Drawer content model

The drawer contains:

- one horizontal tile rail / carousel
- same tile design language as the row
- proper spacing between tiles
- correct overflow scrolling behavior

The drawer must not contain:

- grouped sections
- per-section headings
- helper copy
- visible count furniture unless specifically justified later
- extra IA layers that distract from tool launching

## Carousel behavior

The carousel must support:
- trackpad/wheel interaction where applicable
- mouse horizontal scroll behavior where supported
- touch swipe on touch devices
- keyboard-safe focus traversal

## Scrollbar rule

The carousel may scroll, but the scrollbar must not be visible in the polished UI.

## Tile spacing rule

There must be:
- no overlap
- no crushed spacing
- no half-cut right edge artifacts
- no awkward clipping when partially scrolled

## Visual continuity

The drawer should feel like the launcher’s overflow extension — not like a different product surface.
