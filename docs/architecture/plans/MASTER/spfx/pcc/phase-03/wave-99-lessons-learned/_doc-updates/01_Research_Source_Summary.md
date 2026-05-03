# 01 — Research Source Summary

## Research Direction

The target architecture is informed by lessons learned program research, construction knowledge-management practices, Microsoft approval/versioning patterns, secure-by-design principles, least-privilege evidence-link access patterns, and HBI/AI risk-management guidance.

## Key Findings

### NASA lessons learned lifecycle

NASA frames lessons learned as a lifecycle: collect, record, disseminate, and apply. Lessons may be captured through discussions, write-ups, repositories, reports, publications, case studies, and other knowledge-sharing mechanisms.

Architecture impact:

- PCC must capture lessons continuously, not only at project closeout.
- PCC must separate draft capture from reviewed record and published/disseminated knowledge.
- PCC must measure whether lessons are applied back into checklists, templates, standards, training, and future project planning.

### NASA reviewed lesson repository and retrieval model

NASA's public Lessons Learned system contains official, reviewed lessons, indexed for retrieval through simple or complex search criteria. It also supports profile-based notification concepts.

Architecture impact:

- Lessons Learned Center must define review states and publication states.
- Search/filter/relevance design is part of architecture, not an optional UI feature.
- Approved lessons must support reuse targeting, related lesson matching, and future notification/alert seams.

### Construction Industry Institute lessons learned program research

CII research identifies leadership, lesson collection, lesson analysis, lesson implementation, resources, maintenance/improvement, and culture as key characteristics of effective construction lessons learned programs.

Architecture impact:

- The module must include improvement actions and program-health metrics.
- Executive/operations leadership workflows are required.
- Lessons must be analyzed and implemented, not simply stored.

### Microsoft approval and versioning patterns

Microsoft SharePoint/List versioning and approval patterns support draft, pending, approved, rejected, and visibility-controlled content states.

Architecture impact:

- Lessons require explicit workflow states, approval gates, version/audit history, and draft visibility controls.
- Redacted/approved views must be role-sensitive.

### Microsoft Graph least-privilege posture

Microsoft Graph guidance reinforces least-privileged permissions for app access, including increasingly granular selected permission models for files and SharePoint content.

Architecture impact:

- Evidence links must be reference-based and permission-aware.
- Future Graph integration must be backend-mediated and least-privilege.
- PCC must not rely on broad file/library access for this module.

### NIST AI Risk Management Framework

NIST AI RMF and Playbook establish govern, map, measure, and manage functions for trustworthy AI design, development, deployment, and use.

Architecture impact:

- HBI functions need explicit prompt contracts, source restrictions, confidence handling, refusal cases, audit events, and human approval gates.
- HBI must not approve, publish, expose restricted content, or make business/legal/vendor conclusions.

### OWASP Secure by Design

OWASP Secure by Design emphasizes architecture-time decisions around data classification, access control, monitoring, resilience, and evidence of security decisions.

Architecture impact:

- Lessons Learned requires field-level redaction, role-aware search filtering, audit logs, evidence-link permission checks, and secure degraded/error behavior.

### Procore vendor-performance source patterns

Procore Vendor Performance reporting uses source data from tools such as Commitments, Submittals, Punch List, and RFIs.

Architecture impact:

- PCC may reference Procore-native facts as source lineage and evidence.
- PCC must not duplicate Procore records or treat source-system facts as PCC-owned lessons.
- Subcontractor-performance lessons must be curated and approved before reuse.

## Source URLs

See `reference/source_research_urls.json`.
