<p align="center">
  <img src="https://runme.dev/img/logo.svg" width="200px">
</p>

<p align="center">
  <a href="https://github.com/stateful/runme-action/actions/workflows/test.yml"><img alt="Action Unit Tests Status" src="https://github.com/stateful/runme-action/actions/workflows/test.yml/badge.svg"></a>
  <a href="https://github.com/stateful/runme-action/actions?query=workflow%3Aaudit"><img alt="Action Audit Status" src="https://github.com/stateful/runme-action/workflows/audit/badge.svg"></a>
</p>

## Runme GitHub Action

A GitHub Action to run [Runme](https://runme.dev) in CI. Instead of calling commands and scripts directly as part of your CI step, link existing code snippets from your project documentation into the CI execution to ensure that they stay up to date and valid. It binds documentation snippets with your CI/CD process and helps validate correctness of your project documentation.

The action is powered by [Runme](https://runme.dev) which is a tool that helps you supercharge your markdown files.

> __Note:__ Runme is not yet supported on Windows, see [stateful/runme#173](https://github.com/stateful/runme/issues/173) for status updates.

## Example

Given you have a markdown file that contains one or several set-up scripts, e.g.

    ## Setup

    ### Install Dependencies

    As a first step, please install the project dependencies via:

    ```sh name=installDeps
    npm install
    ```

    ### Build Project

    To build project files and test the project, run:

    ```sh name=build
    npm run compile
    npm run build
    ```

    ### Run Tests

    To run all tests, execute:

    ```sh name=tests
    npx eslint
    npx vitest
    npx wdio run ./wdio.conf.js
    ```

    ...

You can run these documented commands in CI using [Runme](https://runme.dev) via:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    name: Action Test
    steps:
      - uses: stateful/runme-action@v1
        with:
          id: installDeps
```

or run multiple sections in order:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    name: Action Test
    steps:
      - name: Setup / Test Project
        uses: stateful/runme-action@v1
        with:
          id: |
            installDeps
            build
            tests
```

## Inputs

### `command`:

Defines which Runme command to run.

**Default:** `run`

### `id`:

Only use if `command` parameter is set to `run` or `exec`.

**Required** Name of the markdown code cell to run or a list of code cells to execute in order.

### `version`:

Defines which Runme version to use. You can find all Runme release on [GitHub](https://github.com/stateful/runme/releases).

**Default:** `latest`<br />
**Example:** `v0.6.5`

### `cwd`:

Working directory to run the `runme` command in. If set it will be resolved relatively to the workspace directory.

**Default:** workspace directory (defined by `GITHUB_WORKSPACE` environment variable)
**Example:** `./docs`

### `filename`:

Filename for Runme to read commands from.

**Default:** `README.md`

## Contributing & Feedback

Let us know what you think via GitHub issues or submit a PR. Join the conversation [on Discord](https://discord.gg/MFtwcSvJsk). We're looking forward to hear from you.

## LICENCE

Apache License, Version 2.0
