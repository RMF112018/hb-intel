# 05B — Tool Launcher / Work Hub Config and Grouping Contract

## Purpose

Define Prompt-05 grouped launcher configuration rules for the utility/work-zone webpart.

## Contract Surface

- Webpart module: `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- Manifest baseline: `ToolLauncherWorkHubWebPart.manifest.json`
- Config contract: `ToolLauncherWorkHubConfig`
- Normalization seam: `normalizeToolLauncherWorkHubConfig`

## Grouping and Authoring Rules

- Launchers are grouped into authored sections with deterministic section and item ordering.
- Audience filters are optional; configured filters gate visibility via shared audience helper seam.
- Icon treatment is token/key driven and remains lightweight for homepage scanning.
- Badge/status metadata is optional and should reinforce, not overwhelm, launcher labels.

## Failure and Fallback Rules

- Invalid launcher entries (missing id/title/href) are dropped during normalization.
- Empty post-normalization groups are removed.
- If no valid launcher groups remain, webpart renders clear empty-state guidance.

## Ownership and Maintenance

- Site owners maintain grouped launcher content and ordering through config/property-pane data.
- `hb-webparts` maintainers own normalization, visibility handling, and fallback behavior.
