# Estimating Workbench Developer Target Architecture

## Purpose

Define the developer-ready architecture for the PCC Estimating Workbench MVP.

## Core Decision

Estimating Workbench is a SharePoint/SPFx-first MVP module mounted under Project Readiness. It writes to structured SharePoint/PCC estimating lists and libraries and projects estimate/handoff posture into PCC downstream modules.

## System Boundary

PCC owns Estimating Workbench records because this feature replaces a legacy workbook workflow. Sage remains future accounting mapping source. Procore/Autodesk/BuildingConnected remain external/source systems where applicable. PCC does not write back to those systems in MVP.

## User-Facing Areas

- Estimate Home
- My Estimates
- Template Selector
- Estimate Builder
- Cost Summary
- GC/GR
- Scope Package Builder
- Bid Leveling Workbench
- Alternates / Allowances / Contingency
- Assumptions / Inclusions / Exclusions / Qualifications
- Handoff Preview
- Exports / Reports
- Template Admin

## Developer Principle

Every screen must distinguish working/scratch data from canonical downstream data. Handoff requires promoted, mapped, validated, frozen records.
