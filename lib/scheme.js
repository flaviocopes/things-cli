import { execFileSync } from 'node:child_process'

// Things URL scheme: https://culturedcode.com/things/support/articles/2803573/

export function buildUrl(command, params = {}) {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')
  return `things:///${command}${query ? `?${query}` : ''}`
}

export function open(url) {
  execFileSync('open', [url])
}

export function run(command, params) {
  const url = buildUrl(command, params)
  open(url)
  return url
}

// The json command accepts an array of project / to-do objects.
export function runJson(payload) {
  return run('json', { data: JSON.stringify(payload) })
}

export const todo = (title, notes, extra = {}) => ({
  type: 'to-do',
  attributes: { title, ...(notes ? { notes } : {}), ...extra },
})

export const heading = (title) => ({ type: 'heading', attributes: { title } })

export const project = (title, notes, items, extra = {}) => ({
  type: 'project',
  attributes: { title, ...(notes ? { notes } : {}), items, ...extra },
})
