# Agent Closeout Report Template

Use this exact structure after each prompt.

```text
Following execution of prompt-N:
- Status: Closed | Partially Closed | Not Closed
- Files changed:
  - path/to/file
- Implementation summary:
  - ...
- Validation commands run:
  - ...
- Validation results:
  - ...
- Exact outstanding blockers, if any:
  - None | ...
- Commit-ready summary:
  - ...
- Proposed commit message:
  - ...
```

## Additional notes

- Do not claim closure if required validation failed.
- Do not hide unrelated dirty-file risk; state it explicitly.
- Do not create or push a commit unless the operator separately instructs that outside the prompt.
