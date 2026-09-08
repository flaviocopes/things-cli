# AGENTS.md

`things-cli` is a dependency-free Node ESM CLI for the Things 3 macOS app, installed globally as `things` via `npm link`.

- `bin/things.js`: argument parsing (`node:util` `parseArgs`) and the command switch.
- `lib/scheme.js`: builds and opens `things:///` URLs. Used for everything that creates items (`add`, `project`, `import`, `json`). Exports `todo()`, `heading()`, `project()` helpers for the `json` payload.
- `lib/script.js`: JavaScript for Automation (`osascript -l JavaScript`) for reads and updates. Values always go through `argv`, never string interpolation, to avoid quoting bugs.
- `lib/markdown.js`: parses the `# Title / ## Heading / - task / indented notes` format used by `things import`.
- `test/`: dependency-free unit tests using `node:test`. Tests must not open Things.

Rules:

- Keep it dependency-free.
- Creating goes through the URL scheme, reading/updating through JXA. Do not add the URL scheme `update` command: it needs the user's auth token.
- No destructive commands (delete/trash) in the CLI.
- Test against a throwaway project named `things-cli test project`, then trash it from the app or with `Application('Things3').delete(project)` in JXA. Never touch real projects in tests.
- Run `npm run check` after code changes. This checks syntax and runs unit tests.
- Keep unit tests deterministic. Mock or isolate macOS integration points.
- Use `--json` when another tool or agent will consume command output.
- Update the README and `.agents/skills/things/SKILL.md` when commands change.
- Writing style for docs and help text: short sentences, plain words, no filler.
