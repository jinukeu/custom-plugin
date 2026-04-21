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

The viewer runs **directly from the skill's own `viewer/` directory** — nothing is copied into the user's project. The user's `StudyVault/` is wired in via a single symlink (`viewer/vault → <user-project>/StudyVault`) that the entry script refreshes on every invocation. This keeps the user's project clean (no `.tutor-view/`, no `node_modules/` pollution, no `.gitignore` edits needed) and removes the "per-project re-sync after plugin update" footgun.

### Step 1: Locate the viewer directory

The skill directory lives wherever Claude Code installed the plugin. Typical locations:

- Marketplace-installed: `$HOME/.claude/plugins/<marketplace>/<plugin>/skills/tutor-view`
- Local / dev install: `$HOME/.claude/skills/tutor-view`

Resolve it dynamically — the viewer is always at `<skill-dir>/viewer`:

```bash
# Prefer the env var Claude Code sets for the running skill, if present.
SKILL_DIR="${CLAUDE_SKILL_DIR:-}"
if [ -z "$SKILL_DIR" ] || [ ! -d "$SKILL_DIR/viewer" ]; then
  # Fallback candidates — pick the first one that exists.
  for candidate in \
    "$HOME/.claude/skills/tutor-view" \
    "$HOME/.claude/plugins"/*/tutor-skills-main/skills/tutor-view \
    "$HOME/.claude/plugins"/*/*/skills/tutor-view; do
    if [ -d "$candidate/viewer" ]; then SKILL_DIR="$candidate"; break; fi
  done
fi
if [ -z "$SKILL_DIR" ] || [ ! -d "$SKILL_DIR/viewer" ]; then
  echo "Viewer not found. Reinstall the tutor-skills plugin."; exit 1
fi
VIEWER_DIR="$SKILL_DIR/viewer"
```

### Step 2: Link the user's StudyVault into the viewer

```bash
PROJECT_DIR="$(pwd)"
VAULT_PATH="$PROJECT_DIR/StudyVault"
if [ ! -d "$VAULT_PATH" ]; then
  echo "StudyVault not found at $VAULT_PATH. Run /tutor-setup first."; exit 1
fi

# Atomic symlink refresh. Points to the current project's StudyVault — last
# /tutor-view invocation wins if multiple vaults exist on the machine.
ln -sfn "$VAULT_PATH" "$VIEWER_DIR/vault"
```

> **Why symlink, not copy**: Vite's `import.meta.glob` resolves at build time with a static literal path. We can't inject a vault path at runtime, so a fixed-name symlink (`viewer/vault`) is the contract.

### Step 3: Install dependencies (once per plugin version)

```bash
cd "$VIEWER_DIR"
if [ ! -d node_modules ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
  npm install
fi
```

`node_modules/` lives inside the skill directory. It's gitignored at the plugin level and not touched by plugin updates (Claude Code's sync only replaces tracked source files — untracked `node_modules/` and `dist/` survive). When `package.json` changes (plugin version bump with new deps), the `-nt` check triggers a reinstall.

### Step 4: Start dev server

```bash
cd "$VIEWER_DIR"
npm run dev
```

Default URL: `http://127.0.0.1:5173` with HMR.

If the user's vault directory is named something other than `StudyVault`, have them symlink it before invoking:

```bash
ln -sfn path/to/actual-vault StudyVault   # in the user's project root
```

### Alternative: static build

If the user passes `--build` or asks for a deployable site:

```bash
cd "$VIEWER_DIR" && npm run build
```

Produces `$VIEWER_DIR/dist/`. Since the build bakes in the currently-symlinked vault's contents, copy `dist/` out before the next `/tutor-view` invocation on a different project, or it'll be overwritten:

```bash
cp -R "$VIEWER_DIR/dist" "$PROJECT_DIR/tutor-view-dist"
```

Then serve with `npx serve tutor-view-dist`.

## Concurrent projects

The viewer is **single-tenant per machine**: the `viewer/vault` symlink points to one vault at a time. Running `/tutor-view` in project B while the dev server for project A is live will repoint the symlink, which HMR then picks up — effectively switching the open browser tab to project B's vault. If the user needs two vaults open simultaneously, they should open the first in a static build (`npm run build` → `npx serve dist`) and the second with the dev server.

## Updating the viewer

Plugin updates replace source files in `$SKILL_DIR/viewer/` automatically. `node_modules/` and `dist/` are preserved (they're untracked). Step 3's `-nt` check handles dependency changes. No per-project sync needed — this is the primary win of running from the skill directory.

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
