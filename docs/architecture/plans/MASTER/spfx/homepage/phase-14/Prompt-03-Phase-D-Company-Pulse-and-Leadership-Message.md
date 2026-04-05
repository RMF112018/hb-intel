# Prompt 03 — Phase D Company Pulse and Leadership Message

## Objective

Rebuild **Company Pulse** and **Leadership Message** so they no longer feel like lightly varied versions of the same generic content cluster.

Use the new or refined shared-kit primitives from Prompt 02.

These two surfaces should feel related only at the highest brand/system level. Their content model, hierarchy, authorship, and supporting treatments should be materially distinct.

## Hard instruction

Do **not** re-read files already in your active context or memory unless needed to resolve uncertainty or confirm a changed dependency.

## Required target outcomes

### Company Pulse
It should read like:
- editorial / internal news
- fresh, scannable, curated
- strong featured story plus secondary briefs or summaries
- more publication-like than dashboard-like

### Leadership Message
It should read like:
- authored executive communication
- intentional and important
- more formal and message-led
- clearly attributable to a leader / office / function

## Company Pulse requirements

Implement repo-truth-grounded improvements such as:
- stronger editorial spotlight treatment for the featured item
- clearer category / freshness / source metadata
- improved secondary item brief layout
- better CTA model
- stronger distinction between headline, summary, and metadata
- cleaner editorial spacing rhythm
- improved visual relationship between featured and secondary items

Avoid:
- generic card sameness
- badge-only differentiation
- secondary items that look like tiny copies of the featured item

## Leadership Message requirements

Implement repo-truth-grounded improvements such as:
- stronger authored-message shell
- more premium attribution treatment
- clearer leadership context / office / role presentation
- better relationship between message body and attribution
- stronger supporting CTA and archive affordance where appropriate
- cleaner treatment for secondary or historical message items if present

Avoid:
- memo-like blandness
- generic content-cluster rhythm
- leadership content looking interchangeable with Company Pulse

## Shared-kit usage

Use the shared family primitives from Prompt 02. If a missing shared need is discovered that truly belongs in the kit, add it carefully and document it.

Do not solve recurring needs with local one-off code unless there is a strong justification.

## Deliverables

At minimum:
- updated Company Pulse implementation
- updated Leadership Message implementation
- any supporting shared-kit refinements needed
- docs/comments/tests/story fixtures as repo truth supports

## Validation requirements

Prove:
- the two surfaces are clearly differentiated at a glance
- hierarchy is stronger
- metadata is more structured
- CTAs are more intentional
- no regression in accessibility, truncation, responsiveness, or reduced motion

## Risk Exposure

- Editorial and authored surfaces may still converge if metadata and shells are too similar.
- Over-styling leadership content can become theatrical instead of premium.
- Weak secondary-item treatment can keep Company Pulse feeling generic.

## Standards / Best Practices

- editorial hierarchy for news
- authored hierarchy for leadership
- meaningful metadata
- restrained branded polish
- accessibility preserved
