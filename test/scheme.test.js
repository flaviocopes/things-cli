import assert from 'node:assert/strict'
import test from 'node:test'
import { buildUrl, heading, project, todo } from '../lib/scheme.js'

test('buildUrl omits empty values and escapes parameters', () => {
  assert.equal(
    buildUrl('add', {
      title: 'Call the accountant',
      notes: '',
      list: 'Admin & money',
      when: undefined,
    }),
    'things:///add?title=Call%20the%20accountant&list=Admin%20%26%20money',
  )
})

test('payload helpers create Things JSON objects', () => {
  assert.deepEqual(
    project('Weekend', 'Two days', [
      heading('Saturday'),
      todo('Bike ride', 'Bring water', { when: 'evening' }),
    ]),
    {
      type: 'project',
      attributes: {
        title: 'Weekend',
        notes: 'Two days',
        items: [
          { type: 'heading', attributes: { title: 'Saturday' } },
          {
            type: 'to-do',
            attributes: {
              title: 'Bike ride',
              notes: 'Bring water',
              when: 'evening',
            },
          },
        ],
      },
    },
  )
})
