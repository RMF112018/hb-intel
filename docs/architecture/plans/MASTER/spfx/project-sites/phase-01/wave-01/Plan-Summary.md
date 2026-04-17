# Plan Summary — Wave 01

Wave 01 is the dependency foundation for the whole end-state effort.

The current Project Sites surface already has usable polish, but its trust model is incomplete:
- host-year semantics are declared but not honored
- shell-passed runtime config is ignored
- the data adapter remains too inference-heavy
- launch-state meaning is too coarse

This wave resolves those structural issues first so later UX refinement rests on authoritative behavior rather than UI-level guesswork.
