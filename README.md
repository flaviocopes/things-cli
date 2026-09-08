# things-cli

A small command line tool for the [Things 3](https://culturedcode.com/things/) app on macOS.

I built it so I (and my coding agents) can add projects, tasks and notes to Things from the terminal, and read them back as text or JSON.

No dependencies. Node 20+.

## Install

Install directly from GitHub:

```bash
npm install -g github:flaviocopes/things-cli
```

Or clone the repository:

```bash
git clone https://github.com/flaviocopes/things-cli.git ~/dev/things-cli
cd ~/dev/things-cli
npm link
```

This puts a `things` command on your PATH.

## How it works

Two mechanisms, picked per command:

- **Creating** things uses the [Things URL scheme](https://culturedcode.com/things/support/articles/2803573/) (`things:///add`, `things:///add-project`, `things:///json`). It's fast and it supports headings and nested to-dos in one shot. It does not need an auth token.
- **Reading and updating** uses AppleScript (JavaScript for Automation) so we get structured data back and can change notes or complete tasks without the URL scheme auth token.

Things must be installed. It gets launched if it is not running.

## Commands

### Create

```bash
things add "Email Railway" --project "flaviocopes.com sponsors" --heading "Top 5" --notes "They buy direct"
things add "Call the accountant" --when tomorrow --deadline 2026-09-12 --tags work,money
things add "Pack" --checklist "passport,charger,adapter"

things project "Launch newsletter redesign" --area "flaviocopes.com" --notes "Ship by October"
```

`--notes -` reads the notes from stdin.

### Import a whole project from Markdown

```bash
things import sponsors.md
```

The file format:

```markdown
# Project title
Project notes. Anything before the first heading or task.

- A task at the top, before any heading
  Its notes, indented.

## A heading
- Task title
  Task notes, indented under the task.
  More notes.
- Another task

## Another heading
- One more task
```

Headings are optional. A JSON file works too, with the raw payload format of `things:///json`:

```bash
things import payload.json
things json '[{"type":"to-do","attributes":{"title":"Buy milk"}}]'
```

### Read

```bash
things show "flaviocopes.com sponsors"         # project notes + every to-do with notes
things show "flaviocopes.com sponsors" --json
things list                                    # today
things list inbox                              # inbox, upcoming, anytime, someday, logbook
things projects
things areas
things search "railway"
```

### Update

```bash
things note "Email Railway" --in "flaviocopes.com sponsors" --set "Sent Sep 8"
things note "Email Railway" --in "flaviocopes.com sponsors" --append "They replied, call Thursday"
things note "flaviocopes.com sponsors" --file notes.txt     # project notes from a file
cat notes.txt | things note "flaviocopes.com sponsors" --set -

things done "Email Railway" --in "flaviocopes.com sponsors"
things open "flaviocopes.com sponsors"                       # show it in the app
```

Without `--in`, `note` and `done` look for a project with that name first, then for any to-do.

## Use with coding agents

The repository includes a portable Agent Skill at `.agents/skills/things/SKILL.md`. Compatible agents can discover it and learn the safe workflow.

You can ask an agent to work with Things in plain language:

- "Add a task to call the accountant tomorrow."
- "Turn this conversation into a Things project."
- "Show my tasks for today and help me choose three."
- "Append this decision to the newsletter project notes."
- "Mark Update the home page as done in Launch newsletter redesign."

### Turn a plan into a project

Ask the agent:

> Create a Things project from this plan. Keep the background in the project notes. Group the work under headings, then verify the imported project.

The agent can write a temporary Markdown file, import it, and read it back:

```bash
things import /tmp/newsletter-project.md
things show "Launch newsletter redesign"
```

### Let an agent review your tasks

Use JSON when the agent needs structured data:

```bash
things list today --json
things show "Launch newsletter redesign" --json
things search "newsletter" --json
```

For example, ask:

> Review today's tasks. Suggest what to do first, but do not change anything.

### Keep the reasoning

Tasks often need context from the conversation. Ask the agent to save that context in the project notes:

```bash
things note "Launch newsletter redesign" --file /tmp/project-notes.md
```

This keeps the plan, decisions, and tasks together.

## Practical tips

- Use exact project and task names. Matching is case sensitive.
- Pass `--in "Project name"` when task names may repeat.
- Ask agents to read before updating uncertain names.
- Use `--json` when another command or agent needs the result.
- Use stdin or `--file` for long notes. This avoids quoting problems.
- Put shared context in project notes, not only inside tasks.
- Ask the agent to verify writes with `things show`.
- The CLI cannot delete anything. This is intentional.

## Use from a script

The `lib/` modules are plain ESM:

```js
import { runJson, project, heading, todo } from './lib/scheme.js'

runJson([
  project('Weekend', 'Two days', [
    heading('Saturday'),
    todo('Bike ride', 'Bring water'),
    todo('Groceries'),
  ]),
])
```

## Limitations

- Names are matched exactly (case sensitive). When several items share a name, the first one wins.
- The `list` command does not read Areas or custom lists, only the built-in ones.
- No delete command on purpose. Trash things from the app.
