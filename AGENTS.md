# AGENTS.md

`things-cli` is a dependency-free Node ESM CLI for the Things 3 macOS app, installed globally as `things` via `npm link`.

- `bin/things.js`: argument parsing (`node:util` `parseArgs`) and the command switch.
- `lib/scheme.js`: builds and opens `things:///` URLs. Used for everything that creates items (`add`, `project`, `import`, `json`). Exports `todo()`, `heading()`, `project()` helpers for the `json` payload.
- `lib/script.js`: JavaScript for Automation (`osascript -l JavaScript`) for reads and updates. Values always go through `argv`, never string interpolation, to avoid quoting bugs.
- `lib/markdown.js`: parses the `# Title / ## Heading / - task / indented notes` format used by `things import`.

Rules:

- Keep it dependency-free.
- Creating goes through the URL scheme, reading/updating through JXA. Do not add the URL scheme `update` command: it needs the user's auth token.
- No destructive commands (delete/trash) in the CLI.
- Test against a throwaway project named `things-cli test project`, then trash it from the app or with `Application('Things3').delete(project)` in JXA. Never touch real projects in tests.
- Writing style for docs and help text: short sentences, plain words, no filler.
