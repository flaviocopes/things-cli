#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { run, runJson } from '../lib/scheme.js'
import { parseProjectMarkdown } from '../lib/markdown.js'
import {
  complete,
  findProject,
  listAreas,
  listNames,
  listProjects,
  listToDos,
  search,
  setNotes,
} from '../lib/script.js'

const HELP = `things - command line for Things 3

Create (URL scheme)
  things add <title> [--notes text] [--project name] [--heading name]
                     [--when today|tomorrow|evening|someday|YYYY-MM-DD]
                     [--deadline YYYY-MM-DD] [--tags a,b] [--checklist a,b]
  things project <title> [--notes text] [--area name] [--when ...] [--tags a,b]
  things import <file.md|file.json>     create a project with headings and to-dos
  things json '<json>'                  raw payload for things:///json

Read (AppleScript)
  things show <project> [--json]        project notes and every to-do with notes
  things list [today|inbox|upcoming|anytime|someday|logbook] [--json]
  things projects [--json]
  things areas [--json]
  things search <text> [--json]

Update (AppleScript)
  things note <title> [--in project] (--set text | --append text | --file path)
  things done <title> [--in project]
  things open <project or list name>    show it in the app

Options
  --notes and --set/--append accept "-" to read the text from stdin.
  --json prints raw JSON instead of text.
`

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    notes: { type: 'string' },
    project: { type: 'string' },
    heading: { type: 'string' },
    area: { type: 'string' },
    when: { type: 'string' },
    deadline: { type: 'string' },
    tags: { type: 'string' },
    checklist: { type: 'string' },
    in: { type: 'string' },
    set: { type: 'string' },
    append: { type: 'string' },
    file: { type: 'string' },
    json: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
})

const [command, ...rest] = positionals

function text(value) {
  if (value === '-') return readFileSync(0, 'utf8').trimEnd()
  return value
}

function need(value, message) {
  if (!value) {
    console.error(message)
    process.exit(1)
  }
  return value
}

function out(data, format) {
  if (values.json) {
    console.log(JSON.stringify(data, null, 2))
  } else {
    console.log(format(data))
  }
}

function formatToDo(t) {
  const marks = []
  if (t.status !== 'open') marks.push(t.status)
  if (t.dueDate) marks.push(`due ${t.dueDate.slice(0, 10)}`)
  if (t.tags) marks.push(t.tags)
  const head = `- ${t.name}${marks.length ? `  [${marks.join(', ')}]` : ''}`
  const body = t.notes ? '\n' + t.notes.split('\n').map((l) => `    ${l}`).join('\n') : ''
  return head + body
}

function formatToDos(items) {
  if (!items.length) return '(empty)'
  return items.map(formatToDo).join('\n')
}

try {
  switch (command) {
    case undefined:
    case 'help':
      console.log(HELP)
      break

    case 'add': {
      const title = need(rest.join(' '), 'Usage: things add <title> [options]')
      const url = run('add', {
        title,
        notes: text(values.notes),
        list: values.project,
        heading: values.heading,
        when: values.when,
        deadline: values.deadline,
        tags: values.tags,
        'checklist-items': values.checklist?.split(',').map((s) => s.trim()).join('\n'),
      })
      console.log(`Added "${title}"`)
      if (values.json) console.log(url)
      break
    }

    case 'project': {
      const title = need(rest.join(' '), 'Usage: things project <title> [options]')
      run('add-project', {
        title,
        notes: text(values.notes),
        area: values.area,
        when: values.when,
        deadline: values.deadline,
        tags: values.tags,
      })
      console.log(`Created project "${title}"`)
      break
    }

    case 'import': {
      const file = need(rest[0], 'Usage: things import <file.md|file.json>')
      const source = readFileSync(file, 'utf8')
      const payload = file.endsWith('.json') ? JSON.parse(source) : [parseProjectMarkdown(source)]
      runJson(payload)
      const list = Array.isArray(payload) ? payload : [payload]
      for (const item of list) {
        const items = item.attributes?.items ?? []
        const todos = items.filter((i) => i.type === 'to-do').length
        const headings = items.filter((i) => i.type === 'heading').length
        console.log(`Imported ${item.type} "${item.attributes?.title}" (${todos} to-dos, ${headings} headings)`)
      }
      break
    }

    case 'json': {
      const raw = need(text(rest[0]), "Usage: things json '<json>'")
      runJson(JSON.parse(raw))
      console.log('Sent')
      break
    }

    case 'show': {
      const name = need(rest.join(' '), 'Usage: things show <project>')
      const p = findProject(name)
      if (!p) {
        console.error(`Project not found: ${name}`)
        process.exit(1)
      }
      out(p, (d) => {
        const parts = [`# ${d.name}${d.area ? `  (${d.area})` : ''}`]
        if (d.notes) parts.push('', d.notes)
        parts.push('', formatToDos(d.toDos))
        return parts.join('\n')
      })
      break
    }

    case 'list': {
      const key = rest[0] ?? 'today'
      out(listToDos(key), formatToDos)
      break
    }

    case 'projects':
      out(listProjects(), (items) =>
        items.map((p) => `- ${p.name}${p.area ? `  (${p.area})` : ''}  [${p.count} to-dos${p.status !== 'open' ? `, ${p.status}` : ''}]`).join('\n'),
      )
      break

    case 'areas':
      out(listAreas(), (items) => items.map((a) => `- ${a.name}  [${a.projects} projects]`).join('\n'))
      break

    case 'search': {
      const q = need(rest.join(' '), 'Usage: things search <text>')
      out(search(q), (items) =>
        items.length ? items.map((t) => `- ${t.name}${t.project ? `  (${t.project})` : ''}`).join('\n') : '(no matches)',
      )
      break
    }

    case 'note': {
      const title = need(rest.join(' '), 'Usage: things note <title> [--in project] (--set text | --append text | --file path)')
      let body
      let append = false
      if (values.file) body = readFileSync(values.file, 'utf8').trimEnd()
      else if (values.set !== undefined) body = text(values.set)
      else if (values.append !== undefined) {
        body = text(values.append)
        append = true
      } else need(null, 'Pass --set, --append or --file')
      const result = setNotes(title, body, { project: values.in, append })
      console.log(`Updated notes of "${result.name}"`)
      break
    }

    case 'done': {
      const title = need(rest.join(' '), 'Usage: things done <title> [--in project]')
      const result = complete(title, { project: values.in })
      console.log(`Completed "${result.name}"`)
      break
    }

    case 'open': {
      const query = need(rest.join(' '), 'Usage: things open <project or list>')
      run('show', { query })
      break
    }

    default:
      console.error(`Unknown command: ${command}\n`)
      console.log(HELP)
      process.exit(1)
  }
} catch (error) {
  const message = error.stderr?.toString().trim() || error.message
  console.error(message.replace(/^execution error:\s*/i, '').replace(/\s*\(-\d+\)$/, ''))
  process.exit(1)
}
