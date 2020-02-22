/**
 * test-put.js
 * copyright 2015-2020, Jürgen Leschner - github.com/jldec - MIT license
 *
**/

var test = require('tape');
var fs = require('fs');
var overwrite = ' - ⌘ - ⌘ - ';

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
  { path: '/f2/8.txt', sha: 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391', text: '' } ];

test('test put, validate, and restore', { timeout:60000 }, function(t) {

  var source = require('..')(
    { repo: process.env.GH_REPO || 'jldec/test-repo',
      branch: process.env.GH_BRANCH || 'test-branch',
      path: '/test/test-put',
      glob: '**/*.*',
      includeBinaries:true,
      writable: true,
      username: (process.env.GH || '') }
  );

  // TODO: delete the test-put sub tree before running this test
  //       avoid errors when previous tests leave behind unexpected files
  source.put(expected, { commitMsg: 'pub-src-github test-put1' }, function(err) {
    t.error(err);
    source.get(function(err, files) {
      t.error(err);
      t.deepEqual(files, expected);
      source.put( [{ path: '/-foo.txt', text: overwrite}], { commitMsg: 'pub-src-github test-put2' }, function(err) {
        t.error(err);
        expected[0].text = overwrite;
        expected[0].sha = '48f8d620cadffa21b93555c16e4da054e4a471d9';
        source.get(function(err, files) {
          t.deepEqual(files, expected);
          t.end(err);
        });
      });
    });
  });

});
