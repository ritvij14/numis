---
description: Execute an intelligent workflow based on current project state and recent context.
allowed-tools: Bash, Read, mcp__task-master-ai__get_tasks, mcp__task-master-ai__next_task, mcp__task-master-ai__get_task, mcp__task-master-ai__set_task_status, mcp__task-master-ai__expand_task
---

Arguments: $ARGUMENTS

## Intelligent Workflow Selection

Based on context, determine the best workflow:

### Context Analysis
- Previous command executed
- Current task states
- Unfinished work from last session
- Arguments provided: $ARGUMENTS

### Smart Execution

If last command was:
- `status` → Likely starting work → Run daily standup
- `complete` → Task finished → Find next task
- `list pending` → Planning → Suggest sprint planning
- `expand` → Breaking down work → Show complexity analysis
- `init` → New project → Show onboarding workflow

If no recent commands:
- Many pending tasks? → Sprint planning
- Tasks blocked? → Dependency resolution
- In-progress tasks exist? → Resume work

### Workflow Composition

Chain appropriate commands:
1. Analyze current state via `mcp__task-master-ai__get_tasks`
2. Execute primary workflow
3. Suggest follow-up actions
4. Prepare environment for coding

### Common Workflows

**Morning startup**
```
get_tasks (status overview) →
next_task →
set in-progress
```

**After completing a task**
```
set_task_status done →
next_task →
expand if complex
```

**End of session**
→ run `wrap-up` skill

Result: Adaptive workflow that meets you where you are.
