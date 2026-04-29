# Interview Decisions — UI Governance Priorities

These decisions are binding inputs for the governance cleanup.

## Product Feel

HB Intel flagship and major SPFx surfaces should feel like a combination of:

- polished executive command center;
- premium custom-built HB product;
- high-density project controls cockpit.

The product should not feel like a generic enterprise dashboard or a thin Fluent/SharePoint reskin.

## Primitive Reuse

Do not reinvent common UI controls:

- buttons;
- fields;
- inputs;
- tables;
- badges;
- dialogs;
- pickers;
- basic layout helpers.

Use governed UI-kit primitives for common items. Brand distinction should come through composition, hierarchy, density, typography, iconography, brand assets, motion, and product-specific framing.

## Density

Density is context-driven:

- PCC and project controls can be compact, information-rich, and cockpit-like.
- Executive and orientation surfaces can have more breathing room.
- Handheld and constrained views should prioritize clarity over raw information volume.

## Brand Expression

Brand expression is context-driven:

- stronger HB identity for flagship shells, command centers, executive surfaces, and orientation moments;
- lighter, more utilitarian treatment for forms, tables, settings, logs, and routine workflows.

## Interaction Style

Interaction style is context-driven:

- refined baseline everywhere;
- richer motion and dynamic behavior only where it improves comprehension, continuity, command-center feel, or executive polish;
- motion must not become theatrical or confusing.

## Layout Philosophy

Use a context-driven hybrid layout model:

- bento/cockpit layouts for overviews, command centers, executive dashboards, project-control summaries, and intelligence surfaces;
- structured workbench layouts for forms, logs, approvals, settings, review tasks, and detailed workflows.

## Data Visualization

Data visualization is context-driven:

- strong metrics, trends, scorecards, and health indicators in executive/project-control overview surfaces;
- restrained, task-supportive indicators in workflow execution screens.

## Trust Model

Operational clarity and data confidence outweigh decoration.

Governance must prioritize:

- obvious status;
- clear next action;
- source/freshness visibility;
- limitations or missing configuration clearly communicated;
- no deceptive affordances or ambiguous CTAs.

## Responsive Design

Desktop, tablet, and mobile should receive equivalent design depth. They do not need identical layouts, but each must feel intentionally designed rather than downgraded or merely “acceptable.”

## Accessibility

Accessibility and keyboard behavior are hard gates for all user-facing surfaces. Deeper proof is required for flagship, field-facing, and decision-critical screens.

## Enforcement Style

Use tiered enforcement:

- strict gates for flagship, SPFx, PCC, major widgets, decision-critical screens, field-facing workflows, and executive command-center surfaces;
- lighter but still clear standards for routine internal screens.

## Brand Kit and Fonts

The HB brand package must be incorporated into governance:

- original brand package stored under `docs/reference/brand/`;
- stable web-ready logo assets curated into `@hbc/ui-kit/branding`;
- approved fonts governed through UI-kit theme/font layer;
- apps must not duplicate raw brand or font files;
- do not redistribute font files outside the repo or generated artifacts.
