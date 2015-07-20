/**
 * pub-src-github.js
 * patches fs-base with github-base to replace readdir, readfile, writefiles
 *
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
**/

var debug = require('debug')('pub:src-github');


module.exports = function sourceGithub(sourceOpts) {

  var ghbase = require('./github-base.js')(sourceOpts);
  var fsbase = require('pub-src-fs/fs-base')(ghbase);

  return {
    get: get,
    put: put
  };


  function get(options, cb) {
    if (typeof options === 'function') { cb = options; options = {}; }

    fsbase.readfiles(options, function(err, result) {
      debug('get %s %s file(s)', sourceOpts.name, err || result.length);
      cb(err, result);
    });
  }

  function put(files, options, cb) {
    if (typeof options === 'function') { cb = options; options = {}; }
    if (!sourceOpts.writable) return cb(new Error('cannot write to non-writable source'));

    // use queue to serialize since fsbase.writefiles was replaced with ghbase.writefiles
    fsbase.queue.push(function(next) {
      fsbase.writefiles(files, options, function(err, result) {
        debug('put %s %s file(s) %s', sourceOpts.name, files.length, err || '');
        next();
        cb(err, result);
      });
    });
  }

}
