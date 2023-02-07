const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');



console.log('\n\n\n\n\n\n===================================================\n\n\n')
fs.readFile(file, 'utf8', function (err, html) {

  if (err) {
    console.log("err: ", err)
  }

  if (html) {
    console.log("html: ", html)
  }


  // fs.writeFileSync(path.join(__dirname, 'test.txt'), output);


  // fs.writeFileSync(path.join(__dirname, 'songs.txt'), songList);

});


function trimAll(x) {
  return x.replace(/^\s+|\s+$/gm, '');
}

function containsAny(str, substrings) {
  for (var i = 0; i != substrings.length; i++) {
    var substring = substrings[i];
    if (str.indexOf(substring) != -1) {
      return substring;
    }
  }
  return null;
}