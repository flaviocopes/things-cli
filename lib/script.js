import { execFileSync } from 'node:child_process'

// Reads and updates go through JavaScript for Automation (JXA) so we get
// structured data back and never need the URL scheme auth token.
// Values are passed as argv, so no quoting problems.

function jxa(body, args = []) {
  const source = `
    ObjC.import('stdlib')
    function run(argv) {
      const app = Application('Things3')
      const out = (function (argv) { ${body} })(argv)
      return JSON.stringify(out === undefined ? null : out)
    }
  `
  const result = execFileSync('osascript', ['-l', 'JavaScript', '-e', source, '--', ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  return JSON.parse(result)
}

const TODO_FIELDS = `
  function pick(t) {
    let projectName = null
    try { const p = t.project(); projectName = p ? p.name() : null } catch (e) {}
    let areaName = null
    try { const a = t.area(); areaName = a ? a.name() : null } catch (e) {}
    return {
      id: t.id(),
      name: t.name(),
      notes: t.notes(),
      status: t.status(),
      tags: t.tagNames(),
      dueDate: t.dueDate() ? t.dueDate().toISOString() : null,
      activationDate: t.activationDate() ? t.activationDate().toISOString() : null,
      project: projectName,
      area: areaName,
    }
  }
`

export function findProject(name) {
  return jxa(
    `${TODO_FIELDS}
    const matches = app.projects.whose({ name: argv[0] })()
    if (!matches.length) return null
    const p = matches[0]
    return {
      id: p.id(),
      name: p.name(),
      notes: p.notes(),
      status: p.status(),
      tags: p.tagNames(),
      area: (function () { try { const a = p.area(); return a ? a.name() : null } catch (e) { return null } })(),
      toDos: p.toDos().map(pick),
    }`,
    [name],
  )
}

export function listProjects() {
  return jxa(`
    return app.projects().map((p) => ({
      name: p.name(),
      status: p.status(),
      area: (function () { try { const a = p.area(); return a ? a.name() : null } catch (e) { return null } })(),
      count: p.toDos().length,
    }))`)
}

export function listAreas() {
  return jxa(`return app.areas().map((a) => ({ name: a.name(), projects: a.projects().length }))`)
}

const LISTS = {
  inbox: 'Inbox',
  today: 'Today',
  upcoming: 'Upcoming',
  anytime: 'Anytime',
  someday: 'Someday',
  logbook: 'Logbook',
  trash: 'Trash',
}

export function listNames() {
  return Object.keys(LISTS)
}

export function listToDos(listKey) {
  const listName = LISTS[listKey.toLowerCase()]
  if (!listName) throw new Error(`Unknown list "${listKey}". Use one of: ${listNames().join(', ')}`)
  return jxa(`${TODO_FIELDS} return app.lists.byName(argv[0]).toDos().map(pick)`, [listName])
}

export function search(text) {
  return jxa(
    `${TODO_FIELDS}
    const needle = argv[0].toLowerCase()
    return app.toDos()
      .filter((t) => t.status() === 'open' && (t.name().toLowerCase().includes(needle) || (t.notes() || '').toLowerCase().includes(needle)))
      .map(pick)`,
    [text],
  )
}

function locate(title, projectName) {
  // Returns JXA code that leaves the target in `target`, or throws.
  return projectName
    ? `
      const projects = app.projects.whose({ name: argv[1] })()
      if (!projects.length) throw new Error('Project not found: ' + argv[1])
      const items = projects[0].toDos.whose({ name: argv[0] })()
      if (!items.length) throw new Error('To-do not found in project: ' + argv[0])
      const target = items[0]`
    : `
      const projects = app.projects.whose({ name: argv[0] })()
      const target = projects.length ? projects[0] : app.toDos.whose({ name: argv[0] })()[0]
      if (!target) throw new Error('Nothing found named: ' + argv[0])`
}

export function setNotes(title, text, { project, append = false } = {}) {
  return jxa(
    `${locate(title, project)}
    const current = target.notes() || ''
    const next = ${append ? `current ? current + '\\n\\n' + argv[2] : argv[2]` : 'argv[2]'}
    target.notes = next
    return { name: target.name(), notes: next }`,
    [title, project ?? '', text],
  )
}

export function complete(title, { project } = {}) {
  return jxa(
    `${locate(title, project)}
    target.status = 'completed'
    return { name: target.name(), status: target.status() }`,
    [title, project ?? ''],
  )
}
