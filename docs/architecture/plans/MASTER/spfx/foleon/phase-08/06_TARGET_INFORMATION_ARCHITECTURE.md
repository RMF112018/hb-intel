# HB Central Leadership Message Foleon Reader Rescue

**Date:** 2026-04-27  
**Scope:** Repo-truth audit, screenshot-hosted UI/UX assessment, subject-matter research, remediation plan, and prompt package for the Leadership Message Foleon reader lane.  
**Status:** Planning / code-agent implementation package. No production code is changed by this package.

> Audit boundary: this package is based on the live `main` branch inspected through GitHub connector access, the user-provided hosted screenshot, and public subject-matter research. Hosted validation was screenshot-based only; no authenticated browser automation was run against the tenant in this session.


## Target Information Architecture

## 1. Leadership Message Header

### Purpose

Establish lane identity, state, and credibility without stealing hierarchy from the headline.

### Content

- Lane label: `A message from leadership`
- State: `Current`, `Preview`, `Scheduled`, `Archived`, `Unavailable`, `Opens in Foleon`
- Optional source: executive role or leadership office if real data exists
- Optional date: published date or period label

### Do not include

- `Leadership Message reader`
- `Preview layout`
- `Cadence`
- `Archive group`
- `Reader lane`
- `Content type key`

## 2. Executive Identity / Source

### Preferred

- executive name;
- executive role/title;
- governed portrait or avatar;
- source office such as `Office of the President`.

### Fallback

- `From leadership`
- omit identity block if headline and lane label are enough.

### Do not show

- `Executive byline not provided.`
- `Sample executive byline`
- fake initials/photo.

## 3. Message Theme / Headline

### Source

Use `record.title`.

### Rules

- Production headline must be the Foleon title or a governed headline field.
- Preview headline may be `Leadership message preview`, but only inside a preview-safe state.
- Never use `Leadership Message reader` as the headline.

## 4. Editorial Summary

### Source

Use `record.summary`.

### Rules

- Max 2-3 lines in homepage row.
- If missing, show either no summary or a neutral fallback in no-live/blocked states only.
- Do not show a fake message body.

## 5. Pull Quote or Key Message

### Source

Use a real field only.

### Current interim

Do not derive a pull quote from the first sentence of summary for production. It creates false editorial emphasis.

### Rules

- If `pullQuote` exists, render it as optional emphasis.
- If not, omit entirely.

## 6. Foleon Launch CTA

### Source

Derived from target/open mode/media availability.

### Labels

| Condition | CTA |
|---|---|
| live, readable | `Read the leadership message` |
| live, generic | `Open full message` |
| video/rich media | `Watch the message` |
| external-only | `Open in Foleon` |
| preview-only | `Preview layout only` or no CTA; explain state |
| unavailable | disabled CTA with visible reason |

## 7. Status / Availability

### Required state model

- current live message;
- preview-only;
- no live message;
- blocked/unavailable;
- external-open-only;
- expired/archived;
- scheduled/future if display dates support it.

## 8. Supporting Context

### Allowed context

- published date;
- topic/category if specific;
- message period if governed;
- audience only if targeted or meaningful;
- read/watch time if real or reliably derivable;
- media type if real.

### Omit

- cadence;
- archive group;
- sync source;
- Foleon doc id;
- placement key;
- content type key when it is just `Leadership`.

## IA Priority Order

1. State/source row.
2. Headline.
3. Summary.
4. CTA.
5. Optional source identity.
6. Optional quote.
7. Optional context chips.
8. Warnings/status notes.
