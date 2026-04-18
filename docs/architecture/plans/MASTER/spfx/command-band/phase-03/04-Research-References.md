# 04 — Research References

This audit used external guidance to strengthen the package design and closure requirements.

## Accessibility patterns
- **WAI-ARIA APG — Button Pattern**
  - Used to reinforce keyboard activation, focus expectations, and action-trigger semantics.
- **WAI-ARIA APG — Disclosure Pattern**
  - Used to evaluate the current inline overflow panel and to define minimum keyboard/ARIA semantics if disclosure remains the chosen pattern.
- **WAI-ARIA APG — Menu Button Pattern**
  - Used to define the stricter accessibility requirements if overflow becomes a real command menu or anchored action popover.

## React state and identity
- **React docs — Preserving and Resetting State**
  - Used to reinforce that UI state is tied to stable identity and render position.
  - Relevant to the admin bug where persisted identity is currently inferred from array position during save.

## Responsive/component behavior
- **web.dev — Container Queries**
  - Used to justify moving command-band responsiveness away from a viewport-only mindset and toward container-aware behavior.
  - Especially relevant for SharePoint-hosted webparts that may render in different columns and widths.

## SharePoint / SPFx host-fit
- **Microsoft Learn — Accessibility in SharePoint web part design**
  - Used to reinforce keyboard expectations, list/menu navigation, focus behavior, and the need for hosted accessibility validation in real SharePoint runtime conditions.

## How the research changed the package
The research directly strengthened:
- overflow interaction requirements
- keyboard and focus expectations
- admin preview fidelity requirements
- responsive behavior requirements
- hosted validation requirements
- state-identity closure expectations
