# Risk Exposure and Guardrails

## Primary Risks

1. **Wave 8 dependency gap** — Wave 9 may accidentally reinvent framework contracts if Wave 8 is not implemented.
2. **Checklist-table regression** — The UI may degrade into one giant checklist screen or three static tabs.
3. **Runtime overreach** — Local agent may add Graph/PnP/Procore/Sage/Outlook runtime to make evidence or external references “real.”
4. **Evidence ownership confusion** — Wave 9 may accidentally own document storage instead of linking to HB Document Control Center.
5. **Approval execution creep** — Approvals and checkpoints may be rendered as executable actions instead of posture signals.
6. **Safety compliance overclaim** — Safety-readiness UI may imply OSHA compliance or incident-management behavior.
7. **Source traceability loss** — Normalized titles may replace exact source text instead of preserving it.
8. **Lockfile/package churn** — Agent may add libraries for charts, parsing, or UI affordances unnecessarily.

## Required Guardrails

- Preserve exact source text for canonical checklist-derived items.
- Preserve family/source/page/section/item-number traceability.
- Separate master template definitions from project-instance state.
- Treat evidence as link/reference posture; storage remains Document Control / SharePoint project record.
- Treat Procore/Sage/Outlook/AHJ as external references only.
- Treat safety content as readiness posture only, not compliance engine behavior.
- Treat approvals as readiness/checkpoint posture only, not approval execution.
- Treat Priority Actions integration as read-model/signal posture only, not queue mutation.
- Keep all actions inert/disabled unless a later prompt authorizes execution.
- Do not change packages, lockfile, manifests, SPFx packaging, or workflows unless explicitly authorized.
