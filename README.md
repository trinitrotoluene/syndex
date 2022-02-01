# Syndex

> Sync your MongoDB indexes between clusters.

Indexes are an important part of getting acceptable performance from your MongoDB cluster as you scale to larger datasets. It's a common use-case for your deployment environments to be running on entirely separate MongoDB servers, and the de-facto standard approach of relying on an ODM like Mongoose to sync your indexes or maintaining them by hand isn't acceptable if your goal is a fully automated deployment pipeline.

Syndex solves this problem by creating a single (version controlled) source of truth for your indexes which can be used to bring the state of the database up to date automatically as part of your CI/CD pipeline.

## How to use

### Create your index file
```json
{
  "collection1": [
    {
      "name": "index1",
      "keys": {
        "key1": 1,
        "key2": -1
      },
      "options": {
        "background": true
      }
    }
  ]
}
```
### Install syndex
```
npm i -g syndex
```
or
```
npx syndex
```

### Diff

You'll probably want to approach any tool that automatically executes queries against your database with caution - and might want to sanity check your index file. You can have syndex generate a diff indicating how it perceives the database differs from the definition in your index JSON configuration using the `diff` command.

```
syndex diff database1 indexes.json --connection-string <your_connection_string>
```

### Plan

Using the generated diff, syndex will build a sequence of actions it plans to take against the database - the plan - and you can view it in addition to the diff that generated it using the plan command.

```
syndex plan database1 indexes.json --connection-string <your_connection_string>
```

### Sync

After verifying that your index diff lines up with what your goals are, and that the generated plan looks correct, you can sync the changes to your database. **This will execute queries against your database**.

```
syndex sync database1 indexes.json --connection-string <your_connection_string>
```

## Automation

### GitHub Actions

Your ultimate goal in using an automated index syncing tool is probably to automate the process of deploying your indexes between environments. This guide is for GitHub actions, but it should be simple to adapt it to your CI system of choice.

Create the following re-usable action in your `.github/workflows` folder. For the purposes of this guide we'll assume that you called it `sync-indexes.yml`.

```yaml
name: MongoDB (index sync)
on:
  workflow_call:
    inputs:
      INDEXES_FILE:
        required: true
        type: string
      DATABASE:
        required: true
        type: string
    secrets:
      MONGO_CONNECTION_STRING:
        required: true

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js environment
        uses: actions/setup-node@v2.5.1
        with:
          node-version: 16.x
      - name: Install syndex
        run: npm i -g syndex@latest
      - name: Sync indexes
        run: syndex sync ${{ inputs.DATABASE }} ${{ inputs.INDEXES_FILE }} --connection-string ${{ secrets.MONGO_CONNECTION_STRING }}
```

Now you need to create one trigger per cluster you want to sync to - and add a corresponding MONGO_CONNECTION_STRING_<ENV> secret to the repository.

```yaml
name: Trigger (development)
on:
  workflow_dispatch:
  push:
    branches: [ development ]

jobs:
  trigger:
    name: Trigger sync
    uses: ./.github/workflows/indexes-sync.yml
    with:
      INDEXES_FILE: ./indexes.json
      DATABASE: sumo-redux
    secrets:
      MONGO_CONNECTION_STRING: ${{ secrets.MONGO_CONNECTION_STRING_DEVELOPMENT }}
```

> Ensure that `indexes.json` exists at the path specified in `INDEXES_FILE`, or edit it to fit your repository structure.

> **note: You may wish to use environment secrets to set `MONGO_CONNECTION_STRING` instead.**

Now, assuming you've set up two triggers, one for `development` and one for `master` (production), use branch protection rules (or discipline) to ensure you never push to `master` and make all your index changes via pull-requests.
