
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const file = path.join(__dirname, '1970.htm');

let testBlock = 0;
let cnt = 0;
let testCount = 2;


let gdSongs = {};
let gdSongsList = [];

const songFilterRegex = new RegExp(/^[^()<;]/);

const skipList = getSkipList();
const skipListCount = skipList.length;


console.log('\n\n\n\n\n\n===================================================\n\n\n')
fs.readFile(file, 'utf8', function (err, html) {

  html = html.replace(/\n/g, '');
  html = html.replace(/.*?<\/a><br><br><br>/, '');
  const shows = html.split(/<br><br>/);

  let output = '';
  let showCount = shows.length;

  for (let s = 0; s < showCount; s++) {
    let showBlock = shows[s];

    cnt++;

    if (testCount !== 0 && cnt === testCount) {
      break;
    }

    output += processShow(showBlock);

  };

  fs.writeFileSync(path.join(__dirname, 'test.txt'), output);

  let songList = '';
  gdSongsList.sort();
  gdSongsList.forEach(function (song) {
    songList += song + ': ' + gdSongs[song] + '\n';
  });

  fs.writeFileSync(path.join(__dirname, 'songs.txt'), songList);

});

function processShow(showBlock) {
  let output = '';

  let showData = {};
  showData = getShowInfo(showBlock);

  let imageList = showData.imageList;
  let setList = showData.setList;

  output += cnt + '\t(' + showData.match + ')\t' + showData.date + '\t';
  output += showData.band + '\t' + showData.venue + '\t' + showData.city + '\t' + showData.state + '\n\n';

  if (imageList !== undefined && imageList !== null && imageList.length > 0) {
    imageList.forEach((image) => {

      download(image);
      output += image + '\n';
    });
    output += '\n';
  }

  if (setList !== undefined && setList !== null && setList.length > 0) {

    const newSongList = massageSetList(setList, showData.date);

    console.log(showData.date, newSongList)
  }
  return output;
}

function massageSetList(setList, showDate) {

  const showMarkers = [
    '\\(early\\)',
    '\\(late\\)'
  ];

  const setMarkers = [
    'I:',
    'II:',
    'III:',
    'E:'
  ];

  let earlyLateIsMarked = false;
  let earlyLateIsMarkedWith = '';
  let multipleSetsIsMarked = false;
  let multipleSetsIsMarkedWith = '';

  let newSongList = {};

  [earlyLateIsMarked, earlyLateIsMarkedWith] = doesStartWith(showMarkers, setList);
  [multipleSetsIsMarked, multipleSetsIsMarkedWith] = doesStartWith(setMarkers, setList);

  console.log(showDate, 'el: ', earlyLateIsMarked, earlyLateIsMarkedWith, 'ms: ', multipleSetsIsMarked, multipleSetsIsMarkedWith);

  // earlyLate TRUE and multipleSets FALSE
  if (earlyLateIsMarked === true && multipleSetsIsMarked === false) {

    let show = '';
    setList.forEach((song) => {
      let justTheSong = '';
      const [isMarked, markedWith] = doesStartWith(showMarkers, song);

      if (isMarked === true && markedWith !== show) {
        show = markedWith.replace(/\\(\(|\))/g, '');
        newSongList[show] = {}
        const markedWithRegExp = new RegExp(markedWith);
        song = song.replace(markedWithRegExp, '');
      }

      justTheSong = trimAll(song);

      if (isMarked === true) {
        newSongList[show] = {};
        newSongList[show]['only'] = [];
        newSongList[show]['only'].push(justTheSong)
      }
      else {
        newSongList[show]['only'].push(justTheSong)
      }
    });
  }

  // EarlyLateIsMarked FALSE and multipleSetsIsMarked FALSE
  if (earlyLateIsMarked === false && multipleSetsIsMarked === false) {
    const show = 'only';
    setList.forEach((song) => {
      justTheSong = trimAll(song);
      if (newSongList[show] === undefined) {
        newSongList[show] = {};
      }

      if (newSongList[show]['only'] === undefined) {
        newSongList[show]['only'] = [];
      }

      newSongList[show]['only'].push(justTheSong)
    })
  }

  // EarlyLateIsMarked FALSE  mutipleSets TRUE
  if (earlyLateIsMarked === false && multipleSetsIsMarked === true) {
    let set = '';
    newSongList['only'] = {};

    setList.forEach((song) => {
      let justTheSong = '';
      const [isMarked, markedWith] = doesStartWith(setMarkers, song);
      if (isMarked === true && isMarked === true && markedWith !== set) {
        set = markedWith.replace(':\s', '');
        newSongList['only'][set] = []
        song = song.replace(markedWith, '');
      }

      justTheSong = trimAll(song);

      newSongList['only'][set].push(justTheSong)

    })
  }

  return newSongList;
}


function doesStartWith(testStrList, setList) {

  if (typeof setList !== 'object') {
    song = setList;
    setList = [];
    setList.push(song);
  }
  const listLen = setList.length;
  const testStrListLen = testStrList.length;

  if (listLen < 1) return false;
  if (testStrListLen < 1) return false;


  // console.log("*** ", testStrList, setList)
  for (i = 0; i < listLen; i++) {
    for (j = 0; j < testStrListLen; j++) {
      if (testStrList[j] !== null && testStrList[j] !== undefined && testStrList[j] !== '') {
        const regex = new RegExp('^' + testStrList[j]);

        // console.log('\t\t', regex, setList[i])
        if (setList[i].match(regex)) {
          // console.log('\t\t\ttrue');
          return [true, testStrList[j]];
        }
        else {
          // console.log('\t\t\tfalse');
        }
      }
    }
  }

  return [false, ''];
}

function trimAll(x) {
  return x.replace(/^\s+|\s+$/gm, '');
}

function containsAny(str, substrings) {
  for (var i = 0; i != substrings.length; i++) {
    var substring = substrings[i];
    if (str.indexOf(substring) != - 1) {
      return substring;
    }
  }
  return null;
}

async function download(linkString) {
  // <a href="https://gdsets.com/70tickets/1974-11-09a.jpg"
  // pieces = showString.match(/^.*?(\d{1,2}\/\d{1,2}\/\d\d) *?(.*)$/);
  let url = linkString.match(/^.*?="(.*?)"/)[1];
  let folder = url.match(/^https:\/\/gdsets\.com\/(.*?)\//)[1];
  let fileName = url.match(/^https:\/\/gdsets\.com\/.*?\/(.*?)$/)[1];


  const response = await fetch(url);
  const buffer = await response.buffer();

  const folderPath = path.join(__dirname, folder);
  const imagePath = path.join(folderPath, fileName);
  if (!fs.existsSync(imagePath)) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, {
        recursive: true
      });
    }
    fs.writeFileSync(imagePath, buffer, () =>
      console.log('finished downloading!'));
  }
}


function getShowInfo(showBlock) {

  let showString;
  let showTitleString;
  let match;

  let showData = {
    imageList: null,
    setList: null,
    match: null
  };


  if (showBlock.match(/<a href="#top">/)) {
    match = 0;
  } else if (showBlock.match(/^.*?<font.*?>.*?<?!a href.*?>(\d{1,2}\/\d{1,2}\/\d\d.*?) ?(?:<\/a|<a|<\/font>|$)/)) {
    match = 1;

    showString = showBlock.match(/^.*?<font.*?>.*?<?!a href.*?>(\d{1,2}\/\d{1,2}\/\d\d.*?) ?(?:<\/a|<a|<\/font>|$)/);

    if (cnt === testBlock) {
      console.log(showString);
      console.log('\n\n');
    }

    try {
      showTitleString = showString[1];
    } catch (err) {
      console.log(cnt);
      console.log(match);
      console.log(err);
      console.log(showBlock);
    }
  } else if (showBlock.match(/^.*?<font.*?>.*?<a href.*?>(\d{1,2}\/\d{1,2}\/\d\d.*?) ?(?:<\/a|<a|<\/font>|$)/)) {
    match = 2;

    showString = showBlock.match(/^.*?<font.*?>.*?<a href.*?>(\d{1,2}\/\d{1,2}\/\d\d.*?) ?(?:<\/a|<a|<\/font>|$)/);
    showTitleString = showString[1];

    if (cnt === testBlock) {
      console.log(showString);
      console.log('\n\n');
    }

  } else if (showBlock.match(/^.*?>\d{1,2}\/\d{1,2}\/\d\d.*?</)) {
    match = 3;

    showString = showBlock.match(/^.*?>(\d{1,2}\/\d{1,2}\/\d\d.*?)</);
    showTitleString = showString[1];
  } else if (showBlock.match(/^.*?(\d{1,2}\/\d{1,2}\/\d\d.*?)(?:<a|<\/font>|$)/)) {
    match = 4;

    showString = showBlock.match(/^.*?(\d{1,2}\/\d{1,2}\/\d\d.*?)(?:<a|<\/font>|$)/);

    if (cnt === testBlock) {
      console.log(showString);
      console.log('\n\n');
    }

    try {
      showTitleString = showString[1];
    } catch (err) {
      console.log(cnt);
      console.log(match);
      console.log(err);
      console.log(showBlock);
    }

  } else if (showBlock.match(/^.*?(.{1,2}\/.{1,2}\/\d\d.*?)(?:<a|<\/font>|$)/)) {
    match = 5;

    showString = showBlock.match(/^.*?(.{1,2}\/.{1,2}\/\d\d.*?)(?:<a|<\/font>|$)/);

    if (cnt === testBlock) {
      console.log(showString);
      console.log('\n\n');
    }

    try {
      showTitleString = showString[1];
    } catch (err) {
      console.log(cnt);
      console.log(match);
      console.log(err);
      console.log(showBlock);
    }

  } else {
    console.log('failed typical: \n', showBlock, cnt);
    //process.exit(0);
  }

  if (match > 0) {

    if (showString === null) {
      console.log('show string is null\n', showBlock);
    }

    let images = showBlock.match(/<a href=["|'](.*?)["|']/g)
    let imageList = [];

    showData = dateLocationSplit(showTitleString, match, showBlock)

    if (!showData.loc.match(/^.*released.*$/i)) {
      // output += cnt + '\t(' + match + ')\t' + showData.date + '\t';
      // output += showData.venue + '\t' + showData.city + '\t' + showData.state + '\n';

      if (images !== null && images.length > 0) {
        images.forEach(function (item, index) {
          /* if (!item.match(/archive\.org/) &&
            !item.match(/deaddisc/) &&
            !item.match(/deadblog/) &&
            !item.match(/youtube/) &&
            !item.match(/wikipedia/)
          ) {
            imageList.push(item);
            // output += '\t' + item + '\n';
          } */

          if (item.match(/gdsets\.com/)) {
            imageList.push(item);
          }
        });
      }

      showData.imageList = imageList;

      let setList = [];
      let filteredSongLines = [];
      if (showBlock.match(/<br>(.*?)$/) !== null) {
        let songsBlock = showBlock.match(/<br>(.*?)$/)[1];

        let unfilteredSongLines = songsBlock.split('<br>');

        const uSLCount = unfilteredSongLines.length;
        for (let i = 0; i < uSLCount; i++) {
          let addThis = true;
          for (let j = 0; j < skipListCount; j++) {
            const skipRegex = new RegExp('^.*' + escapeRegExp(skipList[j]) + '.*$', 'i');

            if (unfilteredSongLines[i].match(skipRegex)) {
              addThis = false;
              break;
            }
          }
          if (addThis) {
            filteredSongLines.push(unfilteredSongLines[i])
          }
        }
      }

      const fSLCount = filteredSongLines.length;
      for (let i = 0; i < fSLCount; i++) {
        let songTitles = [];
        songTitles.push(...filteredSongLines[i].split(', '));
        let songTitlesLength = songTitles.length;

        if (songTitles !== null && songTitlesLength > 0) {

          for (k = 0; k < songTitlesLength; k++) {
            let song = songTitles[k].replace(/^ */, '');

            let nextSong = '';
            if (song.match(/^.*E:.*$/) && !song.match(/^E:.*$/)) {
              let firstSong = '';
              [firstSong, nextSong] = song.split(' E: ');
              songTitles.push('E: ' + nextSong);
              songTitlesLength++;
              song = firstSong;
            }

            song = cleanUp(song);

            if (song.match(/>/)) {
              const cSongs = song.split(/> |>/);
              const numberOfSongs = cSongs.length - 1;

              if (cSongs !== null && numberOfSongs > 0) {
                cSongs.forEach(function (song, index) {

                  song = cleanUp(song);

                  if (song.match(songFilterRegex)) {
                    if (gdSongs[song] === null || gdSongs[song] === undefined) {
                      gdSongs[song] = 1;
                      gdSongsList.push(song);
                    } else {
                      gdSongs[song]++;
                    }
                  }

                  if (index < numberOfSongs) {
                    setList.push(song);
                    // output += '\t' + song + '>\n';
                  }/*  else {
                    output += '\t' + song + '\n';
                  } */
                });
              }
            } else {
              if (gdSongs[song] === null || gdSongs[song] === undefined) {
                if (song.match(songFilterRegex)) {
                  gdSongs[song] = 1;
                  gdSongsList.push(song);
                }
              } else {
                if (song.match(songFilterRegex)) {
                  gdSongs[song]++;
                }
              }

              setList.push(song);
              // output += '\t' + song + '\n';
            }
          };
        }
      }

      showData.setList = setList;
    }
    // output += '\n';
  }

  return (showData);
}

function dateLocationSplit(showString, match, showBlock) {
  let pieces;
  if (showString === undefined) {

    console.log('f cnt: \n', cnt)
    console.log('\n')
    console.log('f match: \n', match)
    console.log('\n')
    console.log('f showString: \n', showString)
    console.log('\n')
    console.log('f showBlock: \n', showBlock)
    console.log('\n')

    process.exit(0);
  }

  if (match === 1) {
    pieces = showString.match(/^(\d{1,2}\/\d{1,2}\/\d\d) *?(.*)$/);
  }
  if (match === 2) {
    pieces = showString.match(/^.*?(\d{1,2}\/\d{1,2}\/\d\d) *?(.*)$/);
  }
  if (match === 3 || match === 4) {
    pieces = showString.match(/^.*?(\d{1,2}\/\d{1,2}\/\d\d) *?(.*)$/);
  }
  if (match === 5) {
    pieces = showString.match(/^.*?(.{1,2}\/.{1,2}\/\d\d) *?(.*)$/);
  }

  if (pieces === null) {
    console.log('f cnt: \n', cnt)
    console.log('\n');
    console.log('f match: \n', match)
    console.log('\n');
    console.log('f showString: \n', showString)
    console.log('\n\n')
    console.log('f showBlock: \n', showBlock)
    console.log('\n\n')
    console.log('f pieces: ', pieces)
    console.log(pieces);


    process.exit(0);
  } else {
    let mon, dom, year;
    [mon, dom, year] = pieces[1].split('/');
    mon = padding(mon);
    dom = padding(dom);
    year = yearPadding(year);

    pieces[1] = `${mon}/${dom}/${year}`;

    loc = pieces[2].substring(1);

    let bandVenueString, band, venue, city, state;
    [bandVenueString, city, state] = loc.split(', ');

    [band, venue] = bandVenueString.split(' - ');

    return {
      date: pieces[1],
      loc: pieces[2],
      band: band,
      venue: venue,
      city: city,
      state: state,
      match: match
    };
  }
}

function yearPadding(year) {
  if (year > 50) {
    year = `19${year}`;
  }
  if (year < 50) {
    year = `20${year}`;
  }
  return year;
}

function padding(data) {
  if (data < 10) {
    data = `0${data}`
  }
  return data
}

function getSkipList() {
  return [
    'Dave\'s Picks',
    'Download Series v. 2</a',
    'included',
    '30 Trips Around The Sun',
    'Arthur Lee',
    'Download Series',
    '<i>'
  ]

}

function escapeRegExp(stringToGoIntoTheRegex) {
  return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}


function cleanUp(song) {
  song = song.replace(/^E: /, '');
  song = song.replace(/^E: /, '');
  song = song.replace(/ *$/, '');
  song = song.replace(/ {2,}/g, ' ');
  song = song.replace(/\*+$/, '');


  song = getReplcement(song);

  return song;
}


function getReplcement(song) {
  const swaps = {
    "'Til the End of the World": "'Til the End of the World Rolls Around",
    "'Til the End of the World Rolls Round": "'Til the End of the World Rolls Around",
    "Are You Lonely For Me": "Are You Lonely For Me Baby",
    "Attics of My Life": "Attics Of My Life",
    "Cryptical Envelopement": "Cryptical Envelopment",
    "Down Where the River Bends": "Down Where The River Bends",
    "Eating Out of Your Hand": "Eating Out Of Your Hand",
    "Friend of The Devil": "Friend Of The Devil",
    "Goin' Down The Road": "Goin' Down The Road Feelin' Bad",
    "Going Down The Road": "Goin' Down The Road Feelin' Bad",
    "Hideaway": "Hide Away",
    "I Hear A Voice Callin": "I Hear A Voice A Callin'",
    "I Hear A Voice Callin'": "I Hear A Voice A Callin'",
    "I've Been Around This World": "I've Been All Around This World",
    "It Takes a Lot To Laugh It Takes A Train To Cry": "It Takes A Lot To Laugh It Takes A Train To Cry",
    "Like a Road": "Like A Road",
    "Me & Boibby McGee": "Me & Bobby McGee",
    "Me And Bobby McGee": "Me & Bobby McGee",
    "Me And My Uncle": "Me & My Uncle",
    "Old And In The Way": "Old & In The Way",
    "Pig In a Pen": "Pig In A Pen",
    "Portland Women": "Portland Woman",
    "Silver Threads And Golden Needles": "Silver Threads & Golden Needles",
    "Silver Thread and Golden Needles": "Silver Threads & Golden Needles",
    "Silver Threads": "Silver Threads & Golden Needles",
    "The Weight<strong": "The Weight",
    "Willie and the Hand Jive": "Willie & the Hand Jive"
  };

  if (swaps[song] !== undefined) {
    return swaps[song]
  } else {
    return song
  }

}