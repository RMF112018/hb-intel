# Human ECharts Dependency Prerequisite

## Purpose

The local agent must not install dependencies due to hard gates/rules. The user installs `echarts` manually.

## Command

```bash
pnpm --filter @hbc/spfx-project-control-center add echarts
```

## Expected Changes

The command is expected to modify:

```text
apps/project-control-center/package.json
pnpm-lock.yaml
```

## Required MD5 Handling

Before install, capture:

```bash
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

After install, capture:

```bash
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

The changed checksum is expected. The local agent must document it as user-owned prerequisite work and must not revert it.

## Agent Rules

The local agent must:

- not run `pnpm add`;
- not install `echarts`;
- not install `echarts-for-react`;
- not change dependency versions unless user instructs it;
- verify that `echarts` is available before implementing analytics;
- stop with a clear blocker message if `echarts` is missing at the start of Prompt 03.

## Blocker Message If Missing

```text
BLOCKED_BY_MISSING_ECHARTS

The Phase 06 analytics foundation requires the user-installed `echarts` dependency.
Do not install it as the code agent. Ask the user to run:

pnpm --filter @hbc/spfx-project-control-center add echarts

After installation, record the new `pnpm-lock.yaml` md5 and resume Prompt 03.
```
