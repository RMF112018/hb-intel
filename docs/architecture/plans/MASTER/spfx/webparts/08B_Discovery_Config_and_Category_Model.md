# 08B — Discovery Config and Category Model

## Purpose

Define Prompt-08 discovery configuration model for categories, quick paths, promoted destinations, and curated search resources.

## Config Model

- Categories define scannable grouping for discovery resources and deterministic section ordering.
- Resources include title, destination, type, optional descriptions/icon tokens, optional audience visibility, optional keywords, and promoted flags.
- Quick paths capture intent-oriented shortcuts with concise metadata and deterministic ordering.
- Strategy metadata explicitly records curated-first behavior and future search enhancement posture.

## Normalization Expectations

- Invalid or duplicate items are removed before rendering.
- Audience filtering is applied before category and promoted grouping.
- Query filtering uses normalized text and keyword matching across curated resources.
- Unknown/missing categories are safely bucketed under a general discovery grouping.

## Ownership and Maintenance

- Site owners maintain authored discovery content and relevance.
- `hb-webparts` maintainers own normalization logic, category shaping, and search/fallback behavior.
- Prompt-09 and Prompt-10 should consume this model as fixed input unless an explicit superseding decision is approved.
