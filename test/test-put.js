/**
 * test-put.js
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
 *
**/

suite('pub-src-github test-put');

var assert = require('assert')

var stored   = 'file some -->  ⌘ <---'
var overwrite = ' - ⌘ - ⌘ - ';

var expected = [
  { path: '/-foo.txt', text: overwrite },
  { path: '/1/9.txt', text: '' },
  { path: '/1.txt', text: '' },
  { path: '/2/10.txt/11.txt', text: '' },
  { path: '/2/10.txt/12.txt', text: '' },
  { path: '/2/10.txt/13/14.txt', text: '' },
  { path: '/2.txt', text: '' },
  { path: '/3.txt', text: '' },
  { path: '/4.txt', text: '' },
  { path: '/5.txt', text: '' },
  { path: '/f1/6.txt', text: '' },
  { path: '/f1/7.txt', text: '' },
  { path: '/f2/8.txt', text: '' }
];


test('test put, validate, and restore', function(done) {
  this.timeout(5000);

  var source = require('..')(
  { repo: process.env.GH_REPO || 'jldec/pub-src-github',
    path: '/test/test-put',
    glob: '**/*.txt',
    writable: true,
    username: (process.env.GH || '') }
  );

  source.put(expected, 'pub-src-github test-put1', function(err) {
    if (err) return done(err);
    source.get(function(err, files) {
      if (err) return done(err);
      assert.deepEqual(files, expected);
      source.put( [{ path: '/-foo.txt', text: stored}], { commitMsg: 'pub-src-github test-put2' }, function(err) {
        if (err) return done(err);
        expected[0].text = stored;
        source.get(function(err, files) {
          if (err) return done(err);
          assert.deepEqual(files, expected);
          done();
        });
      });
    });
  });

});
