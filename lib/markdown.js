import { heading, project, todo } from './scheme.js'

// Markdown project format:
//
//   # Project title
//   Project notes. Any paragraphs before the first heading or task.
//
//   ## Heading
//   - Task title
//     Task notes, indented under the task.
//     More notes.
//   - Another task
//
// Headings are optional. Tasks before any heading go at the top of the project.

export function parseProjectMarkdown(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  let title = null
  const notes = []
  const items = []
  let current = null
  let seenBody = false

  const flush = () => {
    if (current) {
      items.push(todo(current.title, current.notes.join('\n').trim()))
      current = null
    }
  }

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '')

    if (/^# /.test(line) && title === null) {
      title = line.slice(2).trim()
      continue
    }
    if (/^## /.test(line)) {
      flush()
      items.push(heading(line.slice(3).trim()))
      seenBody = true
      continue
    }
    if (/^[-*] /.test(line)) {
      flush()
      current = { title: line.slice(2).trim(), notes: [] }
      seenBody = true
      continue
    }
    if (current && (/^\s+\S/.test(line) || line === '')) {
      current.notes.push(line.trim())
      continue
    }
    if (!seenBody && title !== null) {
      notes.push(line)
      continue
    }
    if (line !== '') {
      throw new Error(`Cannot parse line: "${line}"`)
    }
  }
  flush()

  if (title === null) throw new Error('Project markdown needs a "# Title" line')
  return project(title, notes.join('\n').trim(), items)
}
