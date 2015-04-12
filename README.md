# pub-src-github

Github source for pub-server and pub-generator

* provides `get()` and `put()` for bulk reads and writes
* works in conjunction with `pub-src-fs/fs-base`
* assumes that all files are utf-8 text
* globs and descends directories

## src(options)

```javascript
var src = require('pub-src-github');

// instantiate source
// options become properties of source
var source = src(
{ repo:'jldec/date-plus',
  branch:'master',
  path:'/',
  glob:'*.md' } );

source.get(function(err, files) {
  if (err) return console.log(err);
  console.log(_.pluck(files, 'path'));
});

```

### source.repo, source.branch
- `repo` is required
- `branch` will default to 'master'

### source.username, source.password
- `username` and `password` may be required to access private repos
- 

### source.path
- defaults to '/'

### source.glob
- `glob` is a [node-glob](https://github.com/isaacs/node-glob) pattern

### source.depth
- `depth` limits the depth of directory descent when source.glob includes `**/` (globstar)

### source.get(cb)
- `get()` fetches all matching files in one async operation
- the result is an array of file objects each with a `path:` and a `text:` property 
- the array is sorted alphabetically by path
- results do not include directories, but do include files in subdirectories
- if the source is writable, `get()` is atomic with respect to `put()` or other `source.get()` operations

```javascript
[ { path: '/README.md',
    text: '...' } ]
```

### source.put(files, [options], cb)
- does nothing unless `writable` is set on the source
- commits an array of file objects in a single commit
- is atomic with respect to `source.get()` or other `source.put()` operations
- returns an array of the paths written

```javascript
source.put(
  files,
  {commitMsg: 'hello'},
  function(err, result) {
    if (err) return console.log(err);
    console.log(result);
  }
);
```

### configuring access to a github repo
- github provides account settings, under "Applications" to create "Personal access tokens"
- this is just a string which can be used in the API and behaves like a password
- to configure repo access for pub-src-github, set the following variables in your environment

```sh
export GH={your-access-token}
export GH_REPO={your-repo}
```

- `tests/test-get` can read this module's github repo, but `tests/test-put` requires an access token to write to the repo
- in order to run `npm test` yourself, first generate your own personal access token, and run the tests against your fork











