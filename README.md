# custom-plugin

A personal [Claude Code](https://docs.anthropic.com/en/docs/claude-code) plugin marketplace.

## Install this marketplace

From inside Claude Code, register the marketplace once:

```
/plugin marketplace add jinukeu/custom-plugin
```

Then install any plugin from it:

```
/plugin install <plugin-name>@custom-plugin
```

Refresh or remove the marketplace later with:

```
/plugin marketplace update custom-plugin
/plugin marketplace remove custom-plugin
```

## Available plugins

| Plugin | Description |
|--------|-------------|
| [`tutor`](./tutor/) | Turn documents into a portable markdown StudyVault, quiz yourself at the concept level, and browse it in a local web viewer. Bundles `/setup`, `/tutor`, and `/view`. |

### Install a plugin

```
/plugin install tutor@custom-plugin
```

### Uninstall a plugin

```
/plugin uninstall tutor@custom-plugin
```

## Repository layout

```
custom-plugin/
├── .claude-plugin/
│   └── marketplace.json       # Marketplace manifest (name, owner, plugin list)
└── tutor/                    # tutor plugin source
    ├── .claude-plugin/        # (optional, per-plugin manifest)
    ├── skills/
    │   ├── setup/
    │   ├── tutor/
    │   └── view/
    ├── README.md
    └── LICENSE
```

## Adding a new plugin

1. Create a new top-level directory with the plugin's `skills/`, `agents/`, `commands/`, or `hooks/` as needed.
2. Add an entry to `.claude-plugin/marketplace.json` under `plugins`:

   ```json
   {
     "name": "my-plugin",
     "source": "./my-plugin-dir",
     "description": "Short description",
     "version": "0.1.0",
     "category": "productivity",
     "tags": ["example"]
   }
   ```

3. Commit and push. Users run `/plugin marketplace update custom-plugin` to pick up changes.

## License

Each plugin is licensed independently — see the plugin's own `LICENSE` file.
