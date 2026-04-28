# 05 — Target Information Architecture

## Hard Reset IA

Replace current primary nav with:

1. **Feed Desk**
2. **Schedule**
3. **Preview**
4. **Admin**

## Why This IA

This matches the work of managing a news-feed type application:

- Feed Desk = manage daily queue and slots.
- Schedule = manage timing and planned/expired content.
- Preview = validate employee-facing output.
- Admin = configure and troubleshoot.

## Feed Channels / Slots

Channels are not top-level navigation. They are managed inside the Feed Desk.

Required slots:

- Project Spotlight
- Company Pulse
- Leadership Message

Each slot shows:

- Live now
- Next scheduled / staged
- Status
- Display window
- Blockers
- Primary action

## Feed Desk Layout

Feed Desk is the default and should contain:

1. **Source/status rail or compact row**
   - Last sync
   - API ready / OAuth blocked
   - content count
   - placement count

2. **Feed Slots strip**
   - Project Spotlight
   - Company Pulse
   - Leadership Message
   - each slot summarized as compact cards/tiles, not a separate board page

3. **Editorial Queue**
   - Search
   - Filters
   - Sort
   - Rows/table/list of content

4. **Inspector / Detail Panel**
   - Opens when row is selected
   - Shows selected content details
   - Lets user assign lane, set display window, validate, preview, activate/stage

## Schedule Layout

Schedule should contain:

- upcoming placements,
- active placements,
- expired placements,
- display windows,
- conflicts/blockers.

Implementation can start as a list/table. A calendar can come later.

## Preview Layout

Preview should contain:

- selected feed/channel preview,
- selected content preview,
- source Foleon open,
- employee-facing reader preview if governed route is available,
- explicit blocked state if preview route is not ready.

## Admin Layout

Admin contains:

- readiness summary,
- required admin actions,
- API/OAuth status,
- Graph/list status,
- package/runtime proof,
- diagnostics and sync history.

Admin should not be the first impression.

