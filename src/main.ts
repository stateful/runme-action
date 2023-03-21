import path from 'node:path'

import exec from '@actions/exec'
import { getInput, setFailed, info, error } from '@actions/core'

import { installRunme } from './installer.js'

const DEFAULT_COMMAND = 'run'
const DEFAULT_FILENAME = 'README.md'

async function run(): Promise<void> {
  const version = getInput('version')
  const command = getInput('command') || DEFAULT_COMMAND
  const codeCellId = getInput('id')

  if (command === 'run' && !codeCellId) {
    throw new Error('Runme Action: run command has no "id" parameter to execute')
  }

  const filename = getInput('filename') || DEFAULT_FILENAME
  const cwd = getInput('cwd')
    ? path.resolve(process.env.GITHUB_WORKSPACE!, getInput('cwd'))
    : process.env.GITHUB_WORKSPACE
  const [runmePath, runmeVersion] = await installRunme(version)

  info(`Running Runme ${runmeVersion}`)
  const params = [command, `chdir=${cwd}`, `filename=${filename}`]
  await exec.exec(runmePath, params, { cwd })
}

run().catch((error) => setFailed(error.message))
