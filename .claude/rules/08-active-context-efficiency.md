# 08 — Active Context Efficiency

## Purpose

Reduce unnecessary repeated file reads while preserving repo-truth validation and evidence quality.

---

## Primary Rule

Do not reread files that are still within active context or memory unless there is a reason to verify them again.

Efficiency must not override repo-truth validation.

---

## Do Not Reread When

Avoid rereading a file when:

- it was just read in the current task;
- it is still clearly in active context;
- the user asks a continuation question about the same file;
- no change could have occurred;
- line-level proof is not needed;
- a summary from the current task is sufficient.

---

## Reread When

Reread or verify the file when:

- the file may have changed;
- line-level verification is needed;
- final validation or closeout reporting requires proof;
- the scope expanded;
- the user asks for a repo-truth audit;
- the task involves post-execution validation;
- the file is a governing source of truth for the current task;
- current memory conflicts with a repo citation or live file result;
- an agent report claims a file changed;
- the file controls a sensitive or gated decision.

---

## Efficient Reading Order

Use targeted reads:

1. nearest package/app files;
2. relevant public exports;
3. relevant tests;
4. relevant README or closeout;
5. governing docs named by current prompt;
6. broader architecture docs only when needed.

Use search before bulk reading when the target is unknown.

---

## Working From Uploaded or Attached Files

When the user provides a file:

- use the uploaded file as the immediate baseline for that request;
- cite it when discussing its contents;
- compare against live repo truth only if the task asks for repo audit or current alignment;
- do not assume the uploaded file is current unless the user says so.

---

## Repo-Truth Audit Exception

If the user explicitly asks for a repo-truth audit, live repo audit, exhaustive audit, or post-execution validation, re-verify current files even if similar files are in memory.

Do not answer an audit from memory alone.

Use `hb-repo-truth-audit`.

---

## Post-Execution Exception

If the user says:

- “following execution”;
- “commit landed”;
- “changes pushed”;
- “agent’s closure summary”;
- “all changes have been pushed”;

then verify current repo state before accepting the claim where tooling is available.

Use `hb-post-execution-closeout`.

---

## Reporting Active Context Use

When relevant, state:

- “I used the current file already in context for X.”
- “I re-verified Y because the task is a repo-truth audit.”
- “I did not reread Z because no change was indicated and it remains in active context.”

Do not over-explain routine efficiency decisions.
