# HB Central Leadership Message Foleon Reader Rescue

**Date:** 2026-04-27  
**Scope:** Repo-truth audit, screenshot-hosted UI/UX assessment, subject-matter research, remediation plan, and prompt package for the Leadership Message Foleon reader lane.  
**Status:** Planning / code-agent implementation package. No production code is changed by this package.

> Audit boundary: this package is based on the live `main` branch inspected through GitHub connector access, the user-provided hosted screenshot, and public subject-matter research. Hosted validation was screenshot-based only; no authenticated browser automation was run against the tenant in this session.


## Recommended Layout Concepts

## Concept A — Executive Letter Feature

### Layout

A calm feature block with a source/status line, headline, concise summary, optional real pull quote, and a strong CTA. Optional executive identity appears as a restrained side rail or top row if real metadata exists.

```text
┌──────────────────────────────────────────────────────────────┐
│ A MESSAGE FROM LEADERSHIP       Current · Apr 2026           │
│                                                              │
│ Building the next chapter together                           │
│ Short teaser explaining why this message matters.             │
│                                                              │
│ “Optional real pull quote only.”                              │
│                                                              │
│ [Read the leadership message]                                 │
└──────────────────────────────────────────────────────────────┘
```

### Strengths

- Most appropriate for written CEO/president updates.
- Feels executive-grade and calm.
- Avoids image dependency.
- Works well without executive photo metadata.

### Weaknesses

- Can become text-heavy if not disciplined.
- Needs strong typography and whitespace to avoid looking plain.

### Data requirements

Minimum: title, summary, viewer target, publish/current status.  
Optional: executive name/role, pull quote, date, topic, image.

### Best use case

Formal strategy updates, quarterly messages, values/culture communications.

### Responsive behavior

Desktop: two-zone feature with CTA aligned below summary.  
Mobile: source/status above headline; summary max 2-3 lines; CTA immediately visible.

## Concept B — Video / Rich Media Feature

### Layout

Media-forward block using hero/thumbnail image, video/rich-media indicator, source/status, headline, summary, CTA.

```text
┌───────────────────────────┬─────────────────────────────────┐
│ Hero image / video still  │ A MESSAGE FROM LEADERSHIP       │
│                           │ Building the next chapter       │
│                           │ Short teaser.                   │
│                           │ [Watch the message]             │
└───────────────────────────┴─────────────────────────────────┘
```

### Strengths

- Best for video or rich-media Foleon editions.
- Clearly signals that the Foleon experience is visual.

### Weaknesses

- Requires high-quality image/video metadata.
- Can conflict visually with Project Spotlight if overused.
- Weak when no real media is available.

### Data requirements

Minimum: title, summary, target.  
Recommended: `heroImageUrl` or `thumbnailUrl`, `hasVideo`, media alt text, CTA intent.

### Best use case

Video leadership messages, all-hands recaps, milestone campaigns.

### Responsive behavior

Desktop: media left or background strip; content right.  
Mobile: optional cropped image above content; CTA remains before metadata.

## Concept C — Leadership Briefing Card

### Layout

Compact high-signal layout with status, theme, headline, short summary, primary CTA, and two-to-three context chips.

```text
A MESSAGE FROM LEADERSHIP · CURRENT

Building the next chapter together
Short summary. Why it matters in one or two sentences.

[Open full message]  Published Apr 2026 · Strategy
```

### Strengths

- Excellent for homepage density and paired-row constraints.
- Strong task clarity.
- Lowest risk if metadata is sparse.

### Weaknesses

- Less emotionally rich.
- Needs careful styling to avoid generic card feel.

### Data requirements

Minimum: title, summary, target, status.  
Optional: date, topic, audience.

### Best use case

Frequent messages, compact homepage rows, sparse metadata.

### Responsive behavior

Same structure desktop/mobile; chips wrap or hide based on priority.

## Recommended Hybrid — Executive Briefing Feature

Use Concept A’s executive-grade tone and Concept C’s density discipline.

### Final recommendation

```text
[Source/status row]
A message from leadership                  Current · Apr 2026

[Headline]
Actual Foleon title

[Summary]
One or two sentences explaining the message topic and why employees should open it.

[Optional key message]
Only if a real pull quote exists.

[Action]
Read the leadership message →

[Restrained context]
Companywide · Strategy · 5 min read   (only if real/derivable)
```

### Design rules

- Do not use fake portraits.
- Do not show missing identity as a negative statement.
- Do not display full message body.
- Do not show more than three context items.
- CTA must remain visible at all breakpoints.
- Media is optional; do not reserve dead media space if no image exists.
