# Persona Registry Reference

This document describes all available personas in HB Intel for development and testing.

## Overview

The Persona Registry provides 11 predefined personas:
- **6 Base Personas**: Core business roles representing primary user types
- **5 Supplemental Personas**: Edge cases and special scenarios for testing

## Base Personas (6)

| Name | Email | Roles | Category | Use Case |
|------|-------|-------|----------|----------|
| Administrator | admin@hb-intel.local | Administrator, Manager | Admin | Full system access, user management, testing admin features |
| AccountingUser | accounting@hb-intel.local | AccountingUser | Finance | Invoice management, financial reports, accounting workflows |
| EstimatingUser | estimating@hb-intel.local | EstimatingUser | Estimating | Project estimation, quote management, estimation tools |
| ProjectUser | project@hb-intel.local | ProjectUser | Project | Project hub access, task tracking, team collaboration |
| Executive | executive@hb-intel.local | Executive, Manager | Management | High-level reporting, read-only access, approval workflows |
| Member | member@hb-intel.local | Member | Basic | Basic user, view-only access, limited permissions |

## Supplemental Personas (5)

| Name | Email | Roles | Category | Use Case |
|------|-------|-------|----------|----------|
| PendingOverride | pending-override@hb-intel.local | Member | Override Request | Testing temporary permission elevation |
| ExpiredSession | expired-session@hb-intel.local | AccountingUser | Session Management | Testing session expiration and re-authentication |
| MultiRole | multi-role@hb-intel.local | Accounting, Estimating, Project | Cross-Module | Testing users with multiple module roles |
| ReadOnly | read-only@hb-intel.local | Viewer | Read-Only | Testing read-only access and permission denial |
| DegradedMode | degraded-mode@hb-intel.local | Administrator | Maintenance | Testing degraded system states and fallback behaviors |

## Using Personas in Development

### Persona Switcher (Dev Toolbar)

1. Open the Dev Toolbar (bottom of screen, collapsible)
2. Click "Personas" tab
3. Select desired persona from list
4. App will simulate login as that persona

### Programmatic Access

