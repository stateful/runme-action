import path from 'node:path'
import cp, { type ChildProcess } from 'node:child_process'

import waitOn from 'wait-on'
import { exec } from '@actions/exec'
import { getInput, getMultilineInput, setFailed, info } from '@actions/core'

import { installRunme } from './installer.js'

const DEFAULT_COMMAND = 'run'
const DEFAULT_FILENAME = 'README.md'
let server: ChildProcess | undefined

async function run(): Promise<void> {
  const version = getInput('version')
  const command = getInput('command') || DEFAULT_COMMAND
  const ids = getMultilineInput('id')
  const serverAddress = getInput('serverAddress')
  const run = getMultilineInput('run')

  if (command === 'run' && ids.length === 0 && run.length === 0) {
    throw new Error('Runme Action: run command has no "id" nor "run" parameter to execute')
  }

  const filename = getInput('filename') || DEFAULT_FILENAME
  const cwd = getInput('cwd')
    ? path.resolve(process.env.GITHUB_WORKSPACE || process.cwd(), getInput('cwd'))
    : process.env.GITHUB_WORKSPACE
  const runmeVersion = await installRunme(version)
  info(`Running Runme ${runmeVersion}`)

  if (serverAddress) {
    info(`Start Runme Server at ${serverAddress}`)
    server = cp.spawn('runme', ['server', '--address', serverAddress], {
      detached: true
    })
    const resource = (
      serverAddress.startsWith('unix://') ||
      serverAddress.startsWith('http://') ||
      serverAddress.startsWith('https://')
    ) ? serverAddress : `http://${serverAddress}`
    await waitOn({ resources: [resource] })
  }

  for (const sh of run) {
    info(`run "${sh}"`)
    await exec(sh, [], { cwd })
  }

  for (const id of ids) {
    const params = [command, id, `--chdir=${cwd}`, `--filename=${filename}`]
    info(`runme ${params.join(' ')}`)
    await exec('runme', params, { cwd })
  }
}

run()
  .catch((error) => setFailed(error.message))
  .finally(() => {
    if (server) {
      info('Shutting down Runme Server')
      server.kill()
    }
  })
