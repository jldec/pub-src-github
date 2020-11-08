/*
 * github-base.js
 *
 * base github reader/writer
 * exports: isfile, readdir, readfile, and writefiles
 * works in conjunction with fs-base to provide full pub-src get and put
 *
 * limitations:
 * - binaries fetched using base64 (less efficient than raw) - superagent #124
 * - no deletes - only create or update file paths
 * - no content streaming
*/

var debug = require('debug')('pub:src-github');
var superagent = require('superagent');
var Queue = require('queue4');
var asyncbuilder = require('asyncbuilder');
var u = require('pub-util');

module.exports = function ghbase(opts) {

  var self;

  if (typeof opts === 'string') {
    self = { repo: opts };
  }
  else {
    self = u.clone(opts) || {}; // avoid side effects on opts
  }

  if (!self || !self.repo) throw new Error('pub-src-github missing repo');

  self.path     = self.path      || '/';

  self.branch   = self.branch    || process.env.GH_BRANCH || 'master';
  self.refparam = '?ref=' + self.branch;

  self.username = (self.auth && self.auth.access_token) || process.env.GH || '';
  self.password = self.password  || '';

  self.agent    = self.agent     || 'pub-server'; // required by gh api
  self.api      = self.api       || 'https://api.github.com';
  self.version  = self.version   || 'application/vnd.github.v3';

  self.endpoint = self.api + '/repos/' + self.repo;

  self.isfile = require('path').extname; // TODO: use API for this
  self.readdir = readdir;

  self.readfile = readfile;
  self.readfileBySha = readfileBySha;

  self.writefiles = writefiles;

  return self;

  //--//--//--//--//--//--//--//--//--//--//--//--//

  function makerequest(method, url, data, cb) {
    var rq = superagent(method, url);

    rq.set('User-Agent', self.agent);
    rq.set('Accept', self.version + '+json'); // always use json

    if (self.timeout)  { rq.timeout(self.timeout); }
    if (self.username) { rq.auth(self.username, self.password); }
    if (data) { rq.send(data); }

    rq.end(function(err, resp) {
      err = (resp && resp.error) || err;
      debug(method + ' ' + url + ' ' + (err || '') + '(X-RateLimit-Remaining: ' + resp.header['x-ratelimit-remaining'] + ')');
      if (err) return cb(err);
      return cb(null, resp.body);
    });
  }

  function get(url, cb)         { makerequest('GET',   url, null, cb); }
  function post(url, data, cb)  { makerequest('POST',  url, data, cb); }
  function patch(url, data, cb) { makerequest('PATCH', url, data, cb); }

  // matches fs.readdir()
  function readdir(fullpath, cb) {
    get(self.endpoint + '/contents' + fullpath + self.refparam, cb);
  }

  // matches fs.readfile()
  function readfile(fullpath, options, cb) {
    if (2 === arguments.length) { cb = options; }
    get(self.endpoint + '/contents' + fullpath + self.refparam, function(err, json) {
      if (err) return cb(err);
      cb(null, Buffer.from(json.content, 'base64'));
    });
  }

  function readfileBySha(sha, cb) {
    get(self.endpoint + '/git/blobs/' + sha, function(err, json) {
      if (err) return cb(err);
      cb(null, Buffer.from(json.content, 'base64'));
    });
  }

  // write an array of files each with path: and (text: or buffer:)
  // call blob interface to write actual bits
  // commit to head of branch at self.path
  // NOTE: doesn't detect collisions or cleanup if any of the steps fails
  function writefiles(data, options, cb) {
    if (typeof options === 'function') { cb = options; options = {}; }

    writeblobs(data, function(err, data) {
      if(err) return cb(err);

      get(self.endpoint + '/git/refs/heads/' + self.branch , function(err, headref) {
        if(err) return cb(err);

        get(self.endpoint + '/git/commits/' + headref.object.sha, function(err, headcommit) {
          if(err) return cb(err);

          // gh api automatically creates new nested tree structure from file paths
          var newtree = {
            base_tree: headcommit.tree.sha,
            tree: u.map(data, function(file) {
              // all text-file blob objects, strip leading / in paths
              return {
                path: u.join(self.path, file.path).replace(/^\/+/,''),
                mode: '100644',
                type: 'blob',
                sha:  file.sha
              };
            })
          };

          post(self.endpoint + '/git/trees', newtree, function(err, postedtree) {
            if(err) return cb(err);

            var newcommit = {
              message: options.commitMsg || 'pub-src-github commit',
              tree: postedtree.sha,
              parents: [headcommit.sha]
            };

            post(self.endpoint + '/git/commits', newcommit, function(err, postedcommit) {
              if(err) return cb(err);

              var newref = { sha:postedcommit.sha };

              patch(self.endpoint + '/git/refs/heads/' + self.branch, newref, function(err) {
                if(err) return cb(err);

                return cb(null, u.pluck(data, 'path'));
              });
            });
          });
        });
      });

    });
  }

  // write an array of files each with path: and (text: or buffer:)
  // mutates data adding file.sha to each file
  // limit concurrency by queueing
  function writeblobs(data, cb) {
    var ab = asyncbuilder(cb);
    var reqQ = new Queue( { concurrency: 5 } );

    u.each(data, function(file) {
      var append = ab.asyncAppend();
      var blob = { encoding: file.buffer ? 'base64' : 'utf-8',
                   content: file.buffer ? file.buffer.toString('base64') : (file.text || '') };

      reqQ.push(function(reqDone) {
        post(self.endpoint + '/git/blobs', blob, function(err, ghblob) {
          if (ghblob) { file.sha = ghblob.sha; }
          append(err, file);
          reqDone();
        });
      });

    });
    ab.complete();
  }

};
