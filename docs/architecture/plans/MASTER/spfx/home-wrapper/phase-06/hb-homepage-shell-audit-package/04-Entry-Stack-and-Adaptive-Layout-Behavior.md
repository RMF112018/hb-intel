# 04 — Entry Stack and Adaptive Layout Behavior

## Baseline diagnosis

The current 14-inch MacBook Pro full-window state is the main failing condition.

The page currently shows:

- a strong hero
- a separate utility row
- no compelling first shell value early enough

That breaks the intended entry rule.

## Entry-stack findings

### Hero
The hero itself is visually premium, but the page-level entry budget is still too tall once the utility layer and spacing are included.

### Action layer
The current visible quick links are:

- too equal-weight
- too numerous for a flagship command posture
- not governed by overflow
- not grouped by frequency or urgency
- visually separate from the shell’s runtime policy

### First shell lane
The first meaningful shell lane is not guaranteed to be visible early enough, and the shell currently allows empty states to claim top-of-shell positions.

## Adaptive behavior findings

### Ultrawide desktop
The shell architecture can support this well. The page should use wider compositions without increasing hero dominance.

### Standard laptop / desktop
This is where the page is currently weakest. The first shell lane needs to begin materially sooner.

### Tablet landscape
The shell’s single-column first-lane rule is good and should remain.

### Tablet portrait
Current doctrine direction is correct: single-column only.

### Phone portrait
The shell’s single-column posture is correct. The separate utility layer remains the bigger risk because it can still feel like a row of tiles rather than a shaped top-actions system.

### Phone landscape / short-height constrained
The shell policy accounts for short-height constraints. The entry surfaces need to actually honor that in live composition and test coverage.

## Concrete adaptive changes required

1. Hero + action + shell must be treated as one vertical budget.
2. Replace OOB Quick Links with governed `PriorityActionsRail`.
3. Align `PriorityActionsRail` device logic with container-aware or shell-aware entry-state policy.
4. Add shell-level non-empty-first first-lane promotion.
5. Ensure later bands can stack, pair, or demote based on real shell fit and real content presence.
6. Add production acceptance checks using the 14-inch MacBook Pro baseline, tablet portrait, and phone portrait.

## Important implementation note

The shell already has a respectable breakpoint policy.
The current problem is not “no breakpoint architecture.”
The current problem is that the **live flagship page experience is still not fully subordinate to that architecture.**
