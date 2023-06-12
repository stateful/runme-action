import cp, { type ChildProcess } from 'node:child_process'

import waitOn from 'wait-on'
import { exec } from '@actions/exec'
import { getInput, getMultilineInput, setFailed, info } from '@actions/core'

import { installRunme } from './installer.js'

let server: ChildProcess | undefined

async function run(): Promise<void> {
  const version = getInput('version')
  const parallel = getInput('parallel') === 'true'
  const workflows = getMultilineInput('workflows')
  const serverAddress = getInput('serverAddress')

  const params = ['run']
  if (parallel) {
    params.push('-p')
  }
  params.push(...workflows)

  const runmeVersion = await installRunme(version)
  info(`Running Runme ${runmeVersion}`)

  if (serverAddress) {
    info(`Start Runme Server at ${serverAddress}`)
    server = cp.spawn('runme', ['server', '--address', serverAddress], {
      detached: true
    })
    await waitOn({
      resources: [`tcp:${serverAddress}`],
      log: true,
      verbose: true
    })
  }

  info(`runme ${params.join(' ')}`)
  await exec('runme', params, {
    env: {
      ...process.env,
      RUNME_PROJECT: '',
    }
  })
}

run()
  .catch((error) => setFailed(error.message))
  .finally(() => {
    if (server) {
      info('Shutting down Runme Server')
      server.kill()
    }
  })
