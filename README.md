**note: This project is still in development. Expect documentation to be incomplete or inaccurate until this notice is removed.**

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
      "background": true
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

