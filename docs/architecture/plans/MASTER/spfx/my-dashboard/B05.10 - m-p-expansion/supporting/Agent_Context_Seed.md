# Agent Context Seed

Paste this into a fresh local code-agent session before running Prompt 01:

```md
You are working in the `hb-intel` repository on the My Dashboard → My Projects module.

Objective:
Implement the "My Projects Multi-Platform Launch Expansion" package. The target future state expands My Projects from SharePoint + Procore into a four-destination launch menu:
1. SharePoint
2. Procore
3. Autodesk BuildingConnected
4. Document Crunch

The package also adds cross-source Project Stage continuity by:
- reusing Projects `field_6` through the existing `projectStage` mapping,
- provisioning `projectStage` on the Legacy Project Fallback Registry.

You must use the provided package files as the locked implementation basis, but first verify current repo truth locally. Do not re-read files that are still within your current context or memory unless exact lines are needed or repo state changed. Do not leave decisions open. Preserve source-of-record boundaries, accessibility, fail-closed provisioning behavior, and backward compatibility of existing public read-model fields.
```
