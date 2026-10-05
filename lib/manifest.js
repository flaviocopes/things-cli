import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { version } = require('../package.json')

export const manifest = {
  name: 'things',
  version,
  summary: 'Add, read and update projects, to-dos and notes in Things 3.',
  capabilities: [
    {
      description: 'Add a to-do to a project with notes, schedule and tags',
      command: 'things add "Renew the domain" --project "Website" --when today --tags work',
    },
    {
      description: 'Create a new project in an area',
      command: 'things project "Launch newsletter redesign" --area "flaviocopes.com" --notes "Ship by October"',
    },
    {
      description: 'Import a whole project from a Markdown or JSON file',
      command: 'things import sponsors.md',
    },
    {
      description: 'Show a project with its notes and every to-do',
      command: 'things show "Launch newsletter redesign"',
    },
    {
      description: 'List to-dos in Today, Inbox or another built-in list',
      command: 'things list today',
    },
    {
      description: 'Search to-dos and projects by text',
      command: 'things search "newsletter"',
    },
    {
      description: 'Set or append notes on a to-do or project',
      command: 'things note "Email Railway" --in "flaviocopes.com sponsors" --append "They replied"',
    },
    {
      description: 'Mark a to-do complete',
      command: 'things done "Email Railway" --in "flaviocopes.com sponsors"',
    },
    {
      description: 'Show a project or list in the Things app',
      command: 'things open "Launch newsletter redesign"',
    },
  ],
  changelog: [
    {
      version: '0.1.0',
      date: '2026-09-07',
      changes: [
        'Create to-dos and projects via the Things URL scheme',
        'Read lists, projects, areas and search results via AppleScript',
        'Import whole projects from Markdown, update notes and complete tasks',
        'JSON output on read commands for agents and scripts',
      ],
    },
  ],
}

export function printManifest(m) {
  console.log(`${m.name} ${m.version}\n${m.summary}\n\nWhat it can do:`)
  for (const capability of m.capabilities) {
    console.log(`  ${capability.description}`)
    if (capability.command) console.log(`    $ ${capability.command}`)
  }
  console.log('\nChanges:')
  for (const release of m.changelog) {
    console.log(`  ${release.version} (${release.date})`)
    for (const change of release.changes) {
      console.log(`    - ${change}`)
    }
  }
}
