/**
 * test-get
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
 *
**/

var test = require('tape');

var expected =
[ { path: '/-foo.txt', text: 'file some -->  ⌘ <---' },
  { path: '/1.txt', text: '' },
  { path: '/2.txt', text: '' },
  { path: '/3.txt', text: '' },
  { path: '/4.txt', text: '' },
  { path: '/5.txt', text: '' },
  { path: '/1/9.txt', text: '' },
  { path: '/2/10.txt/11.txt', text: '' },
  { path: '/2/10.txt/12.txt', text: '' },
  { path: '/2/10.txt/13/14.txt', text: '' },
  { path: '/f1/6.txt', text: '' },
  { path: '/f1/7.txt', text: '' },
  { path: '/f2/8.txt', text: '' } ];

test('test get on tree', { timeout:5000 }, function(t) {

  var source = require('..')(
  { repo: process.env.GH_REPO || 'jldec/pub-src-github',
    path: '/test/tree',
    glob: '**/*.txt',
    username: (process.env.GH || '') } );

  source.get(function(err, files) {
    // console.log(files);
    t.deepEqual(files, expected);
    t.end(err);
  });

});

test('test get on single file', { timeout:5000 }, function(t) {

  var source = require('..')(
  { repo: process.env.GH_REPO || 'jldec/pub-src-github',
    path: '/test/tree/-foo.txt',
    glob: '**/*.txt',
    username: (process.env.GH || '') } );

  source.get(function(err, files) {
    // console.log(files);
    t.deepEqual(files, [expected[0]]);
    t.end(err);
  });

});
