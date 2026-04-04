# 12 — Standards and Best Practices

## Governing Standards

### 1. Homepage system, not homepage monolith
Build a coordinated homepage webpart system.
Do not build one giant homepage application.

### 2. Lightweight by default
Default to lightweight homepage webparts.
Use richer app-style interaction only when clearly justified.

### 3. Premium under SharePoint constraints
Aim above stock SharePoint and above template intranets, but do not pretend platform constraints do not exist.

### 4. SharePoint-native coexistence
Custom webparts must coexist with:
- page sections
- normal authoring workflows
- Microsoft webparts where they still make sense

### 5. Homepage-safe `ui-kit` discipline
Use a constrained homepage-safe visual contract.
Do not treat the full design system as an unrestricted import surface.

### 6. Strong hierarchy
The homepage must have:
- a signature top band
- fast-to-scan action zones
- curated awareness zones
- disciplined operational signal zones
- clear discovery support

### 7. Fewer, better components
A smaller number of stronger webparts is better than homepage sprawl.

### 8. Maintainability is part of quality
A homepage is not premium if it depends on developers for ordinary content changes.

### 9. Accessibility is not optional
Every homepage webpart must support:
- keyboard access
- focus visibility
- semantic structure
- reduced-motion respect
- readable contrast
- responsive usability

### 10. Performance is a release gate
Homepage work must be reviewed for:
- bundle discipline
- above-the-fold weight
- repeated webpart cost
- perceived performance
- unnecessary dependency drag

## Specific Design Best Practices

### Greeting and welcome
- elegant, warm, professional
- not gimmicky
- not oversized for the sake of novelty
- not buried

### Hero treatment
- authored, not assembled
- editorial in hierarchy
- premium but readable
- motion with discipline

### Utility surfaces
- compact, fast, scannable
- more intentional than Quick Links
- no mega-menu behavior

### Awareness surfaces
- curated
- not equal-weight news dumps
- strong featured/secondary distinction

### Operational surfaces
- summary, signal, spotlight
- homepage-appropriate
- not dashboard sprawl

### Discovery surfaces
- guided and structured
- not just a plain search box
- better than a loose collection of links

## Implementation Best Practices

- inspect live code before editing
- update authoritative docs as you go
- keep shared primitives truly shared
- test empty/loading/error states
- protect config validation
- keep authoring ownership clear
- use tasteful motion only where it adds clarity
- avoid cleverness that hurts maintainability

## Anti-Patterns

- one massive homepage webpart
- rebuilding a shell in the homepage
- broad `ui-kit` imports everywhere
- homepage-only one-off styling forks
- hardcoded content that should be authored
- over-animated premium concepts
- low-contrast luxury styling
- hover-only critical information
- flat walls of same-weight cards
- letting every stakeholder request become a homepage feature
