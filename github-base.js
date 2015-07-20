/*
 * github-base.js
 *
 * base github reader/writer
 * exports: isfile, readdir, readfile, and writefiles
 * works in conjunction with fs-base to provide full pub-src get and put
 *
 * limitations:
 * - no binaries or executables - text blobs only
 * - no deletes - only create or update file paths
 * - no content streaming
*/

var superagent = require('superagent');
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

  self.branch   = self.branch    || 'master';
  self.username = (self.auth && self.auth.access_token) || process.env.GH || '';
  self.password = self.password  || '';

  self.agent    = self.agent     || 'pub-server'; // required by gh api
  self.api      = self.api       || 'https://api.github.com';
  self.version  = self.version   || 'application/vnd.github.v3';

  self.endpoint = self.api + '/repos/' + self.repo;

  self.isfile     = require('path').extname, // TODO: use API for this
  self.readdir    = readdir,
  self.readfile   = readfile,
  self.writefiles = writefiles

  return self;

  //--//--//--//--//--//--//--//--//--//--//--//--//

  function makerequest(method, url, data, type, cb) {
    var rq = superagent(method, url);

    rq.set('User-Agent', self.agent);
    if (self.timeout)  { rq.timeout(self.timeout); }
    if (self.username) { rq.auth(self.username, self.password); }
    if (type === 'txt') { rq.set('Accept', self.version + '.raw' ); rq.buffer(); }
                   else { rq.set('Accept', self.version + '+json'); }
    if (data) { rq.send(data); }

    rq.end(function(err, resp) {
      var err = resp.error || err;
      if (err) return cb(err);
      if (type === 'txt') return cb(null, resp.text);
      return cb(null, resp.body);
    });
  }

  function get(url, cb)         { makerequest('GET',   url, null, 'json', cb); }
  function gettext(url, cb)     { makerequest('GET',   url, null, 'txt',  cb); }
  function post(url, data, cb)  { makerequest('POST',  url, data, 'json', cb); }
  function patch(url, data, cb) { makerequest('PATCH', url, data, 'json', cb); }

  // matches fs.readdir()
  function readdir(fullpath, cb) {
    get(self.endpoint + '/contents' + fullpath, cb); // TODO - fix to read proper branch
  }

  // matches fs.readfile()
  function readfile(fullpath, options, cb) {
    if (2 === arguments.length) { cb = options; }
    gettext(self.endpoint + '/contents' + fullpath, cb); // TODO - fix to read proper branch
  }

  // write an array of files each with {path: text:} and commit to branch at self.path
  // NOTE: this doesn't cleanup if any of the steps fails

  function writefiles(data, options, cb) {
    if (typeof options === 'function') { cb = options; options = {}; }

    get(self.endpoint + '/git/refs/heads/' + self.branch, function(err, headref) {
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
              encoding: 'utf-8',
              content: file.text
            };
          })
        };

        post(self.endpoint + '/git/trees', newtree, function(err, postedtree) {
          if(err) return cb(err);

          var newcommit = {
            message: 'pub-server commit: ' + (options.commitMsg || ''),
            tree: postedtree.sha,
            parents: [headcommit.sha]
          };

          post(self.endpoint + '/git/commits', newcommit, function(err, postedcommit) {
            if(err) return cb(err);

            var newref = { sha:postedcommit.sha };

            patch(self.endpoint + '/git/refs/heads/' + self.branch, newref, function(err, patchedref) {
              if(err) return cb(err);

              return cb(null, u.pluck(data, 'path'));
            });
          });
        });
      });
    });
  }

};
