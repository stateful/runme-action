import path from 'node:path'

import { exec } from '@actions/exec'
import { getInput, getMultilineInput, setFailed, info, error } from '@actions/core'

import { installRunme } from './installer.js'

const DEFAULT_COMMAND = 'run'
const DEFAULT_FILENAME = 'README.md'

async function run(): Promise<void> {
  const version = getInput('version')
  const command = getInput('command') || DEFAULT_COMMAND
  const ids = getMultilineInput('id')

  if (command === 'run' && ids.length === 0) {
    throw new Error('Runme Action: run command has no "id" parameter to execute')
  }

  const filename = getInput('filename') || DEFAULT_FILENAME
  const cwd = getInput('cwd')
    ? path.resolve(process.env.GITHUB_WORKSPACE!, getInput('cwd'))
    : process.env.GITHUB_WORKSPACE
  const runmeVersion = await installRunme(version)

  info(`Running Runme ${runmeVersion}`)
  for (const id of ids) {
    const params = [command, id, `--chdir=${cwd}`, `--filename=${filename}`]
    info(`runme ${params.join(' ')}`)
    await exec('runme', params, { cwd })
  }
}

run().catch((error) => setFailed(error.message))
