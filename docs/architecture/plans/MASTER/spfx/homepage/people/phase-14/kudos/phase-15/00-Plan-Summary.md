# 00 — Plan Summary

## Objective

Implement a real `View All` browse experience for the public HB Kudos webpart using the existing slide-out interaction model.

## Current defect

`View All` currently behaves like an in-page archive jump target instead of a real browse/feed experience.

## Required end state

- `View All` opens a slide-out panel
- the slide-out uses the same shell language as the `Give Kudos` form
- the panel displays a feed of all kudos from the `People Culture Kudos` list
- the feed displays kudos content without compaction
- users can browse recognitions as complete content cards/entries, not truncated archive rows

## Primary workstreams

1. Shared `View All` CTA contract correction
2. Public webpart slide-out feed implementation
3. Full-content kudos feed rendering
4. Hosted validation and closure

## Required execution order

1. Shared CTA contract correction
2. Public slide-out feed wiring
3. Full-content feed rendering
4. Hosted validation

## Closure rule

This work is not complete until clicking `View All` opens a real slide-out feed showing full kudos entries from the live list.
