# Agent Context Seed

Paste this into a fresh local code-agent session before Prompt 00:

```md
You are working in the `hb-intel` repo on a new My Dashboard → My Projects feature:

**My Projects Custom Links Registry**

The feature adds a dedicated SharePoint child list and full backend/frontend support for user-authored project links. Links can be:
- private to the creator, or
- project-visible to all users whose My Projects module includes that project.

UI requirements:
- In each project tile/card, custom links appear under a collapsed:
  `More Project Resources`
  disclosure/menu.
- The menu includes an:
  `Add project link`
  action.
- The add-link modal must include this exact helper text:
  `Use this to add trusted project resources such as additional SharePoint sites, permitting sites, private provider portals, and other project-specific destinations.`

Implementation posture:
- Use a dedicated `My Projects Custom Links` list.
- Do not use JSON array fields on Projects/Registry.
- Backend commands only; no direct frontend SharePoint writes.
- Create must revalidate project entitlement.
- Update/delete require creator ownership.
- Soft delete only.
- Private links never leak to non-creators.
- Project-visible links surface only to users already entitled to that project in My Projects.

Do not re-read files that are still within your current context or memory unless exact lines are required or repo state changed.
```
