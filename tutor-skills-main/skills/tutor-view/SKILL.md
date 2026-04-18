---
name: tutor-view
description: >
  Opens a beautiful local web viewer for a StudyVault. Use when the user wants to
  browse their tutor-setup markdown notes, dashboard, and practice questions in a
  browser — with rendered images, Mermaid diagrams, code highlighting, search, and
  dark mode. Triggers: "view my notes", "open vault in browser", "/tutor-view",
  "뷰어 열어줘", "노트 브라우저로 보여줘".
allowed-tools: Read, Write, Edit, Glob, Bash
---

# Tutor View — StudyVault Web Viewer

Bootstraps a Vite + React viewer that renders the user's `StudyVault/` as a polished browsable website. Supports images, Mermaid diagrams, `<details>` fold blocks, relative-path links, code syntax highlighting (Shiki), command-palette search (⌘K), and dark/light theming.

## Pre-flight

1. **Check for StudyVault**: Glob `StudyVault/**/*.md` from CWD. If no matches found, stop and tell the user: "No `StudyVault/` found in current directory. Generate one first with `/tutor-setup`."
2. **Check Node + npm**: Run `node --version && npm --version`. If either missing, tell user to install Node.js 18+ and stop.

## Bootstrap

The viewer template lives in this skill's `viewer/` directory. Copy it into the user's project as `.tutor-view/` (hidden so it doesn't clutter the vault).

### Step 1: Locate viewer template

```bash
SKILL_DIR="$HOME/.claude/skills/tutor-view"
if [ ! -d "$SKILL_DIR/viewer" ]; then
  echo "Viewer template missing at $SKILL_DIR/viewer"; exit 1
fi
```

### Step 2: Copy template to project

```bash
if [ ! -d ".tutor-view" ]; then
  cp -R "$SKILL_DIR/viewer" ".tutor-view"
fi
```

Ensure `.tutor-view/` is gitignored. Add to `.gitignore` if not present:

```bash
grep -qxF '.tutor-view/' .gitignore 2>/dev/null || echo '.tutor-view/' >> .gitignore
```

### Step 3: Install dependencies (first run only)

```bash
cd .tutor-view
if [ ! -d node_modules ]; then
  npm install
fi
```

### Step 4: Start dev server

```bash
npm run dev
```

This opens `http://127.0.0.1:5173` in the default browser with HMR enabled.

The viewer resolves the vault via a fixed relative glob (`../StudyVault/**/*.md` from the `.tutor-view/` directory). Therefore **StudyVault MUST be a sibling of `.tutor-view/`** at the user's project root. If the user's vault has a different name or location, create a symlink:

```bash
ln -s path/to/actual-vault StudyVault
```

### Alternative: static build

If the user passes `--build` or asks for a deployable site:

```bash
npm run build
```

Produces `.tutor-view/dist/`. Can be served with any static host or `npx serve .tutor-view/dist`.

## Updating the viewer

If this skill is reinstalled with an updated `viewer/`, ask the user before overwriting `.tutor-view/`. Preserve `node_modules/` if possible to skip reinstall.

## Features

- **Sidebar** with collapsible folder tree mirroring `StudyVault/` layout
- **Home page** with dashboard card and recent notes
- **Note pages** with serif typography, heading anchors, on-this-page TOC
- **Mermaid** rendered client-side with auto dark/light theme switching
- **Code blocks** highlighted with Shiki + copy button
- **`<details>` fold blocks** with custom styled summaries (arrow rotation animation)
- **Relative-path links** (`[text](path.md)`) resolved to SPA routes
- **Images** loaded from vault (relative paths resolve against note folder)
- **Command Palette (⌘K)** with fuzzy search over titles, headings, and keyword frontmatter
- **Dark / light theme** with system-preference default, persisted to localStorage
- **Reading progress bar** at top of viewport

## Design system

See [design-system.md](references/design-system.md) for typography, color, and layout tokens.
