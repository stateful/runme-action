# Runme GitHub Action

A GitHub Action to run Runme in CI.

## Example

Given you have a markdown file that contains one or several set-up scripts, e.g.

    ## Running

    ### In Minikube

    Deploy the application to Minikube using the Linkerd2 service mesh.

    #### Install the `linkerd` CLI

    ```sh name=installCli
    curl https://run.linkerd.io/install | sh
    ```

    #### Install Linkerd2

    ```sh name=installLinkerD
    linkerd install --crds | kubectl apply -f -
    linkerd install --set proxyInit.runAsRoot=true | kubectl apply -f -
    ```

    #### View the dashboard!

    ```sh name=viewDashboard
    linkerd viz install | kubectl apply -f - # install the on-cluster metrics stack
    linkerd viz dashboard --verbose
    ```

    #### Inject, Deploy, and Enjoy

    ```sh name=injectAndDeploy
    kubectl kustomize kustomize/deployment | linkerd inject - | kubectl apply -f -
    ```

You can run these documented commands in CI using [Runme](https://runme.dev) via:

```yaml
jobs:
    test:
        runs-on: ubuntu-latest
        name: Action Test
        steps:
            - uses: stateful/runme@v1
              with:
                id: installCli
```

or run multiple sections in order:

```yaml
jobs:
    test:
        runs-on: ubuntu-latest
        name: Action Test
        steps:
            - uses: stateful/runme@v1
              with:
                id:
                    - installCli
                    - installLinkerD
                    - viewDashboard
                    - injectAndDeploy
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
