---
name: things
description: Use this project's CLI to add, read, and update projects, tasks, and notes in Things 3 on macOS.
---

# Things CLI

Use `things` instead of writing AppleScript or Things URLs by hand.

Read `README.md` when you need the full command reference.

## Safe workflow

1. Read before updating when a name may be ambiguous.
2. Pass user values as command arguments. Never build JXA source with them.
3. Use `--json` when another command will consume the result.
4. Confirm the result with `things show` or another read command.

## Common commands

```bash
things add "Call the accountant" --when tomorrow --notes "Ask about quarterly tax"
things project "Launch newsletter redesign" --notes "Ship by October"
things show "Launch newsletter redesign" --json
things list today --json
things search "newsletter" --json
things note "Launch newsletter redesign" --append "Design approved"
things done "Update the home page" --in "Launch newsletter redesign"
```

To create a structured project, write Markdown to a temporary file:

```markdown
# Launch newsletter redesign
Keep the project context here.

## Website
- Update the home page
  Add the new screenshots.
```

Then import and verify it:

```bash
things import /tmp/newsletter-project.md
things show "Launch newsletter redesign"
```

## Rules

- Never add delete or trash commands.
- Never modify a real project while testing.
- Use only `things-cli test project` for integration tests.
- Remove that test project when the test finishes.
- Keep the CLI dependency-free.
