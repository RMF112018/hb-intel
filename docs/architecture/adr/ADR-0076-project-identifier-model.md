# ADR-0060: Project Identifier Model — projectId + projectNumber

**Status:** Accepted
**Date:** 2026-03-07

## Context
The existing codebase used a single `projectCode` field as the project identifier throughout
all backend functions, frontend stores, and Azure Table Storage keys. This created ambiguity
between the system-internal key and the human-assigned business reference number.

## Decision
`projectCode` is eliminated entirely. Two distinct identifiers are used:
- `projectId`: UUID v4, auto-generated, immutable, system-internal key.
- `projectNumber`: 9-digit string matching /^\d{2}-\d{3}-\d{2}$/, human-assigned by
  the Controller at provisioning approval, used in SharePoint URLs and external systems.

## Consequences
All backend routes, Azure Table keys, SignalR group names, and frontend stores use `projectId`.
All SharePoint site titles/URLs and external system references use `projectNumber`.
