# CWD Boundary Rule (shared)

> **NEVER access files outside the current working directory (CWD).**
> All source scanning, reading, and vault output MUST stay within CWD and its subdirectories.
> If the user provides an external path, ask them to copy the files into CWD first.

Applies to: `setup`, `sync`. Each skill references this file once instead of restating the rule.
