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

### Step 2: Copy or sync template to project

First-time install: copy the whole template. Subsequent runs: sync source files from the skill's `viewer/` into the existing `.tutor-view/`, preserving `node_modules/` and `dist/` so npm state and prior builds survive. This is critical — without re-sync, viewer updates shipped in a new plugin version never reach the user's project.

```bash
if [ ! -d ".tutor-view" ]; then
  cp -R "$SKILL_DIR/viewer" ".tutor-view"
else
  rsync -a --delete \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude 'tsconfig.tsbuildinfo' \
    "$SKILL_DIR/viewer/" ".tutor-view/"
fi
```

If `rsync` is unavailable, fall back to copying individual source directories (`src/`, `index.html`, `package.json`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`) with `cp -R` overwrite.

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

Step 2 already re-syncs source files on every run, so plugin updates propagate automatically without user prompting. If `package.json` dependencies changed after sync, re-run `npm install` inside `.tutor-view/`. If a prior static build exists in `.tutor-view/dist/`, re-run `npm run build` after sync to refresh it.

## Node polyfills (Buffer)

`gray-matter`는 브라우저에서 Node의 `Buffer`를 참조합니다. `vault-index.ts`의 static import가 `main.tsx` 본문보다 먼저 평가되므로 `main.tsx`에서 수동 polyfill을 해도 타이밍이 늦습니다. 반드시 플러그인 레벨에서 주입해야 합니다.

- `vite.config.ts`에 `vite-plugin-node-polyfills`가 포함되어 있어야 하며, `nodePolyfills({ include: ['buffer'], globals: { Buffer: true } })`로 설정되어 있어야 합니다.
- `main.tsx`에 `window.Buffer = ...` 같은 수동 polyfill을 추가하지 마세요 (static import 체인에 의해 항상 너무 늦음).

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
