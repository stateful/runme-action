import os from 'node:os'
import fs from 'node:fs/promises'
import url from 'node:url'
import path from 'node:path'

import core from '@actions/core'
import { Octokit } from '@octokit/rest'
import { downloadTool, extractTar, cacheDir, find } from '@actions/tool-cache'

const owner = 'stateful'
const repo = 'runme'
const octokit = new Octokit()

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const rootDir = path.resolve(__dirname, '..')

interface GitHubRelease {
  tag_name: string
  name: string | null
  draft: boolean
  prerelease: boolean
}

export async function installRunme(version?: string) {
  const release = await getRelease(version)

  const arch = os.arch()
  const binary = `${os.platform()}_${arch === 'x64' ? 'x86_64' : arch}.tar.gz`
  const downloadUrl = `https://download.stateful.com/runme/${release.tag_name.slice(1)}/runme_${binary}`

  const cachedVersion = find('runme', release.tag_name, arch)
  if (cachedVersion) {
    core.addPath(cachedVersion)
    return [cachedVersion, release.tag_name]
  }

  try {
    /**
     * create download dir
     */
    const downloadDir = await path.resolve(rootDir, 'bin')
    await fs.mkdir(downloadDir, { recursive: true })

    const runmeTar = await downloadTool(downloadUrl)
    const extractedFolder = await extractTar(runmeTar, downloadDir)
    const cachePath = await cacheDir(extractedFolder, 'runme', release.tag_name, arch)
    core.addPath(cachePath)
    return [cachedVersion, release.tag_name]
  } catch (err: unknown) {
    throw new Error(`Failed downloading Runme: ${(err as Error).message}`)
  }
}

async function getRelease(version?: string) {
  const releases: GitHubRelease[] = []

  try {
    const { data } = await octokit.rest.repos.listReleases({ owner, repo })
    releases.push(...data)
  } catch (err: unknown) {
    throw new Error(`Failed to fetch Runme releases: ${(err as Error).message}`)
  }

  const release = version
    ? releases.find((r) => (
      // find by release name
      r.name === version ||
      // find by tag name
      r.tag_name === version
    ))
    // find latest release by looking for the first item that
    //   - is not a draft
    //   - is not a pre-release
    : releases.find((r) => !r.draft && !r.prerelease)

  if (!release) {
    const latestReleases = releases.map((r) => r.tag_name).slice(0, 10).join(', ')
    throw new Error(`Couldn't find Runme release! Trying to download ${version || 'latest'}. Latest releases: ${latestReleases}`)
  }

  return release
}
