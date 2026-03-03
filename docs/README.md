# HB Intel Documentation

Navigation index for the HB Intel documentation suite. All documentation follows the [Diataxis framework](https://diataxis.fr/) with clear audience separation.

## Documentation Structure

| Section | Purpose | Audience |
|---------|---------|----------|
| [Tutorials](./tutorials/) | Learning-oriented, step-by-step onboarding | New developers, new users |
| [How-To Guides](./how-to/) | Goal-oriented practical guides | Users, Administrators, Developers |
| [Reference](./reference/) | Technical facts, API specs, config, glossary | Developers, Operations |
| [Explanation](./explanation/) | Conceptual and architectural understanding | All audiences |
| [User Guide](./user-guide/) | End-user manual | End users |
| [Administrator Guide](./administrator-guide/) | Operations and admin procedures | Administrators |
| [Maintenance](./maintenance/) | Runbooks (backup, patching, monitoring, DR) | Operations |
| [Troubleshooting](./troubleshooting/) | Known issues and common errors | All audiences |
| [Architecture](./architecture/) | Blueprints, ADRs, diagrams, plans | Developers, Architects |
| [Release Notes](./release-notes/) | Per-version change notes | All audiences |
| [Security](./security/) | Compliance and security documentation | Administrators, Security |
| [FAQ](./faq.md) | Frequently asked questions | All audiences |

## Locked Architecture Documents

- [Blueprint V4](./architecture/blueprint/HB-Intel-Blueprint-V4.md) — Complete target architecture (read-only, comment-only updates)
- [Foundation Plan](./architecture/plans/hb-intel-foundation-plan.md) — Exhaustive implementation instructions (read-only, comment-only updates)

## Conventions

- All files are Markdown, version-controlled, and updated with every code change ("Docs as code")
- Every significant architectural decision gets an ADR in `architecture/adr/`
- Documentation is a mandatory deliverable of every implementation phase
