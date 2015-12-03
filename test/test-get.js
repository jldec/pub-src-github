/**
 * test-get
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
 *
**/

var test = require('tape');
var fs = require('fs');

var expected =
[ { path: '/-foo.txt', sha: '86a6733642a2b4683cb8be35aef16e956d75a05d', text: 'file some -->  ⌘ <---' },
  { path: '/1.txt', sha: 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391', text: '' },
  { path: '/2.txt', sha: 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391', text: '' },
  { path: '/3.txt', sha: 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391', text: '' },
  { path: '/4.txt', sha: 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391', text: '' },
  { path: '/5.txt', sha: 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391', text: '' },
  { path: '/ignored.md', sha: '9a16727e997ee4e05d0b4d7bf55a32faa7fb1a24', text: 'this file should not be included in listfies' },
  { path: '/1/9.txt',  sha: 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391', text: '' },
  { path: '/2/4m.png', sha: 'e892c4c90d73ed933e82e93845856daf40b1f2a8', buffer: fs.readFileSync(__dirname + '/tree/2/4m.png') },
  { path: '/2/6k.png', sha: 'dfdde153c6321483756943caf58c686700c72ea5', buffer: fs.readFileSync(__dirname + '/tree/2/6k.png') },
  { path: '/2/10.txt/11.txt', sha: 'd5327cea3d008a23c338724231355dee5e96b0ca', text: 'boogerü\n' },
  { path: '/2/10.txt/12.txt', sha: 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391', text: '' },
  { path: '/2/10.txt/13/14.txt', sha: 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391', text: '' },
  { path: '/2/10.txt/13/level-4/not-ignored.txt', sha: 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391', text: '' },
  { path: '/f1/6.txt', sha: 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391', text: '' },
  { path: '/f1/7.txt', sha: 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391', text: '' },
  { path: '/f2/8.txt', sha: 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391', text: '' } ]

test('test get on tree', { timeout:5000 }, function(t) {

  var source = require('..')(
  { repo: process.env.GH_REPO || 'jldec/pub-src-github',
    path: '/test/tree',
    glob: '**/*.*',
    includeBinaries:true,
    username: (process.env.GH || '') } );

  source.get(function(err, files) {
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
    t.deepEqual(files, [{ path: '/-foo.txt', text: 'file some -->  ⌘ <---' }]);
    t.end(err);
  });

});
