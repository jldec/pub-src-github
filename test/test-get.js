/**
 * test-get
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
 *
**/

suite('pub-src-github test-get');

var assert = require('assert')

var expected = [
  { path: '/-foo.txt', text: 'file some -->  ⌘ <---' },
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

test('test get on tree', function(done) {
  this.timeout(5000);

  var source = require('..')(
  { repo: process.env.GH_REPO || 'jldec/pub-src-github',
    path: '/test/tree',
    glob: '**/*.txt',
    username: (process.env.GH || '') } );

  source.get(function(err, files) {
    if (err) return done(err);
    // console.log(files);
    assert.deepEqual(files, expected);
    done();
  });

});

test('test get on single file', function(done) {

  var source = require('..')(
  { repo: process.env.GH_REPO || 'jldec/pub-src-github',
    path: '/test/tree/-foo.txt',
    glob: '**/*.txt',
    username: (process.env.GH || '') } );

  source.get(function(err, files) {
    if (err) return done(err);
    // console.log(files);
    assert.deepEqual(files, [expected[0]]);
    done();
  });

});