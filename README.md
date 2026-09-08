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
