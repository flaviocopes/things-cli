import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { manifest } from '../lib/manifest.js'

const require = createRequire(import.meta.url)
const { version: pkgVersion } = require('../package.json')

test('manifest matches package.json version and encodes as JSON', () => {
  assert.equal(manifest.name, 'things')
  assert.equal(manifest.version, pkgVersion)
  assert.ok(manifest.summary.length > 0)
  assert.ok(manifest.capabilities.length >= 4 && manifest.capabilities.length <= 10)
  for (const cap of manifest.capabilities) {
    assert.ok(cap.description.length > 0)
  }
  assert.ok(manifest.changelog.length > 0)

  const json = JSON.parse(JSON.stringify(manifest))
  assert.deepEqual(Object.keys(json).sort(), ['capabilities', 'changelog', 'name', 'summary', 'version'])
})
