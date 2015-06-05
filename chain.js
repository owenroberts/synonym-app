var thesaurus = require("thesaurus");

var makeChain = function(startWord, endWord, limit, level, callback) {
  var start = startWord.toLowerCase();
  var end = endWord.toLowerCase();
  var reg = /^[a-z]+$/;

  var allsynomyms = [start];
  var allpaths = [];
  var nodelimit = 20;
  var nodenumber = limit;
  var synonymlevel = level;
  
  var data = {};

  var buildPath = function(word, path, runagain) {
    
    var wordPath = path;
    allsynomyms.push(word);
    var tmp = thesaurus.find(word);
    var synonyms = [];
    for (var i = 0; i < tmp.length; i++) {
      if (reg.test(tmp[i]) 
        && allsynomyms.indexOf(tmp[i]) == -1 
        && allsynomyms.indexOf(tmp[i]+"s") == -1
        && synonyms.length < 10 ) {
        synonyms.push(tmp[i]);
        allsynomyms.push(tmp[i]);
      }
    }

    if (synonyms.length > synonymlevel) {
      synonyms.splice(synonymlevel, synonyms.length - synonymlevel);
    }

    wordPath.push({
      node:word,
      synonyms:synonyms
    });

    for (var i = 0; i < synonyms.length; i++) {
      if (synonyms[i] == end) {
        allpaths.push(wordPath);
      } else {
        if (runagain && wordPath.length < nodenumber) {
          var newpath = wordPath.slice(0);
          buildPath(synonyms[i], newpath, true);
        } else {
        }
      }
    }
  }

  function sendData(newpath) {
    var finalpath = [];
    for (var i = 1; i < newpath.length; i++) {
      finalpath[i - 1] = {};
      finalpath[i - 1].node = newpath[i].node;
      finalpath[i - 1].alternates = newpath[i-1].synonyms;
    }
    data.path = finalpath;
    data.nodelimit = nodenumber;
    callback(null, data);
  }

  function getShortestPath() {
    console.log("shortest " + nodenumber);
    if (allpaths.length > 0) {
      sendData(allpaths[0]);
    } else {
      console.log("nodenumber " + nodenumber + " nodelimit " + nodelimit);
      if (nodenumber < nodelimit) {
        nodenumber++;
        allsynomyms = [start];
        buildPath(start, [], true);
        getShortestPath();
      } else {
        if (nodelimit == 20 && synonymlevel == 20) 
          callback("This search has exceeded the capacity of the algorithm.  Please try a new search.");
        else
          callback("This search was not able to be performed with the current parameters.");
      }
    }
  }


  if (reg.test(start) && reg.test(end)) {
    if (start != end) {
      if (thesaurus.find(start).length > 0) {
        if (thesaurus.find(end).length > 0) {
          buildPath(start, [], true);
          getShortestPath();
        } else {
          callback("The second word was not found.");
        }
      } else {
        callback("The first word was not found.");
      }
    } else {
      callback("Please enter different words.")
    }
  } else {
    callback("Please input single words with no spaces or dashes.");
  }

}

exports.makeChain = makeChain;