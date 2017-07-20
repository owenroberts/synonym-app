var thesaurus = require('thesaurus');

var makeChain = function(query, allsynonyms, callback) {

	var start = query.start.toLowerCase();
	var end = query.end.toLowerCase();
	var reg = /^[a-z]+$/; // test to make sure word only has lower case alphabetic character

	var allpaths = [];
	var nodelimit = 20;
	var nodenumber = query.nodelimit;
	var synonymlevel = query.synonymlevel;
	
	var data = {};

	var attempts = [];
	var count = 0;

	var buildPath = function(word, path, allsyns) {	
		var wordPath = path;
		allsyns.push(word.word);
		var tmp = thesaurus.find(word.word);
		var synonyms = [];
		for (var i = 0; i < tmp.length; i++) {
			if (reg.test(tmp[i]) 
				&& allsyns.indexOf(tmp[i]) == -1 
				&& allsyns.indexOf(tmp[i]+"s") == -1
				&& synonyms.length < 10 ) {
				synonyms.push({
					word:tmp[i],
					weight:i+1
				});
				allsyns.push(tmp[i]);
			}
		}
			
		if (synonyms.length > synonymlevel) {
			synonyms.splice(synonymlevel, synonyms.length - synonymlevel);
		}

		wordPath.push({
			node:word,
			synonyms:synonyms
		});

		if (synonyms.length > 0 && wordPath.length == nodenumber) attempts.push([]);
		for (var i = 0; i < synonyms.length; i++) {
			if (synonyms[i].word == end) {
				wordPath.push({
					node:synonyms[i],
				});
				allpaths.push(wordPath);
			} else if (allpaths < 1) {
				if (wordPath.length < nodenumber) {
					var newpath = wordPath.slice(0);
					buildPath(synonyms[i], newpath, allsyns);
				} else if (wordPath.length == nodenumber) {
					var attempt = [];
					var attemptWeight = 0;
					for (var j = 0; j < wordPath.length; j++) {
						attempt.push(wordPath[j].node.word);
						attemptWeight += wordPath[j].node.weight;
					} 

					attempt.push(synonyms[i].word);
					attemptWeight += synonyms[i].weight;
					
					attempts[attempts.length-1].push({attempt:attempt, weight:attemptWeight});
					count++;
				}
			}
		}
	}

	function sendData(path) {
		var weight = 0;
		for (var i = 0; i < path.length; i++) {
			weight += path[i].node.weight;
		}
		var finalpath = [];
		for (var i = 1; i < path.length; i++) {
			finalpath[i - 1] = {};
			finalpath[i - 1].node = path[i].node;
			finalpath[i - 1].alternates = path[i-1].synonyms;
		}
		data.path = finalpath;
		data.nodelimit = nodenumber;
		data.synonymlevel = synonymlevel;
		data.weight = weight;
		data.attempts = attempts;
		data.count = count;
		callback(null, data);
	}

	function getShortestPath() {
		if (allpaths.length > 0) {
			sendData(allpaths[0]);
		} else {
			if (nodenumber < nodelimit) {
				nodenumber++;
				var newsyns = allsynonyms.slice(0);
				buildPath({word:start, weight:0}, [], newsyns);
				getShortestPath();
			} else {
				if (nodelimit == 20 && synonymlevel == 20) 
					callback("Your search has exceeded the capacity of the algorithm.  Please try a new search.");
				else
					callback("Your search was not able to be performed with the current parameters.");
			}
		}
	}

	if (start && end) {
		if (reg.test(start) && reg.test(end)) {
			if (start != end) {
				if (thesaurus.find(start).length > 0) {
					if (thesaurus.find(end).length > 0) {
						var newsyns = allsynonyms.slice(0);
						buildPath({word:start, weight:0}, [], newsyns);
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
			callback("Please enter single words with no spaces or dashes.");
		}
	} else {
		callback("Please enter two search words.");
	}
}

exports.makeChain = makeChain;