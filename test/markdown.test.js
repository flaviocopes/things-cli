import assert from 'node:assert/strict'
import test from 'node:test'
import { parseProjectMarkdown } from '../lib/markdown.js'

test('parses project notes, headings, tasks, and task notes', () => {
  const source = `# Launch newsletter
Ship the redesign by October.

- Pick a launch date
  Check the course calendar.

## Website
- Update the home page
  Add the new screenshots.
`

  assert.deepEqual(parseProjectMarkdown(source), {
    type: 'project',
    attributes: {
      title: 'Launch newsletter',
      notes: 'Ship the redesign by October.',
      items: [
        {
          type: 'to-do',
          attributes: {
            title: 'Pick a launch date',
            notes: 'Check the course calendar.',
          },
        },
        { type: 'heading', attributes: { title: 'Website' } },
        {
          type: 'to-do',
          attributes: {
            title: 'Update the home page',
            notes: 'Add the new screenshots.',
          },
        },
      ],
    },
  })
})

test('rejects markdown without a project title', () => {
  assert.throws(
    () => parseProjectMarkdown('- Write the announcement'),
    /needs a "# Title" line/,
  )
})

test('rejects unsupported lines after tasks start', () => {
  assert.throws(
    () => parseProjectMarkdown('# Launch\n- Write copy\nNot indented'),
    /Cannot parse line: "Not indented"/,
  )
})
