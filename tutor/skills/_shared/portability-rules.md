# Portability Rules (shared)

All generated/modified notes MUST render correctly in any standard markdown viewer (GitHub, VS Code, mdBook). Do NOT use Obsidian-specific syntax.

| Item | Use | Don't use |
|------|-----|-----------|
| **Links** | `[text](relative/path.md)` | `[[wiki-links]]` |
| **Foldable** | `<details><summary>label</summary>body</details>` | `> [!type]-` callouts |
| **Plain callouts** | `> **Tip:** ...` / `> **Warning:** ...` / `> **Important:** ...` | `> [!tip]` / `> [!warning]` / `> [!important]` |
| **Keywords/tags** | YAML frontmatter `keywords:` field | inline `#kebab-tag` lines |

Applies to: `setup` (generation), `sync` (regeneration). Each skill references this file once.
