var thesaurus = require('thesaurus');

function makeChain(query, allSynonyms, callback) {
	var startWord = query.start.toLowerCase();
	var endWord = query.end.toLowerCase();
	var regTest = /^[a-z]+$/;

	var allChains = [];  // never have more than one path
	const nodeNumberLimit = 20; // no chains more than this number of nodes
	var currentNodeNumber = query.nodelimit; // try to get under this first
	var foundChain = false;
	const synonymLevel = query.synonymlevel;

	var data = {};
	var attemptedChains = [];
	var attemptCount = 0;

	function getSynonyms(word, allSynsCopy) {
		var tempSyns = thesaurus.find(word);
		var synonyms = [];
		for (let i = 0; i < tempSyns.length; i++) {
			let syn = tempSyns[i];
			if (regTest.test(syn)
				&& allSynsCopy.indexOf(syn) == -1
				&& allSynsCopy.indexOf(syn+"s") == -1
				&& synonyms.length < 10) {
				synonyms.push({
					word: syn,
					weight: i + 1,
					syns: []
				});
			}
		}
		if (synonyms.length > synonymLevel) {
			synonyms.splice(synonymLevel, synonyms.length - synonymLevel);
		}
		return synonyms;
	}

	function buildChain(startChain, endChain, allSynsCopy) {
		var currentStartIndex = startChain.length-1;
		var currentEndIndex = endChain.length-1;
		
		allSynsCopy.push(startChain[startChain.length-1].word);
		allSynsCopy.push(endChain[endChain.length-1].word);
		var allSynsCopyCopy = allSynsCopy.slice(0);
		
		console.log(startChain); // undefined fuck me!!!

		if (startChain.syns.length > 0) {
			var startSyns = getSynonyms(startChain[currentStartIndex].word, allSynsCopyCopy);
			startChain[currentStartIndex].syns.push( startSyns );
			for (let i = 0; i < startSyns.length; i++) {
				allSynsCopy.push( startSyns[i].word );
			}
		}

		if (endChain.syns.length > 0) {
			var endSyns = getSynonyms(endChain[currentEndIndex].word, allSynsCopyCopy);
			endChain[currentStartIndex].syns.push( endSyns );
			for (let i = 0; i < endSyns.length; i++) {
				allSynsCopy.push( endSyns[i].word );
			}
		}
		


		
		allSynsCopy.push( endSyns );

		if (startSyns.length + endSyns.length > 0 && startChain.length + endChain.length >= currentNodeNumber)
			attemptedChains.push([]);

		for (var i = 0; i < startSyns.length; i++) {
			var startCopy = startChain.slice(0);
			startCopy.push(startSyns[i]);
			for (var j = 0; j < endSyns.length; j++) {
				if (startSyns[i].word == endSyns[j].word) {
					foundChain = true;
					for (var h = endSyns.length-1; h > 0; h--) {
						console.log(endChain[h])
						startCopy.push( endChain[h] );
					}
					sendData(startCopy);
				} else if (startChain.length + endChain.length < currentNodeNumber && !foundChain) {
					var endCopy = endChain.slice(0);
					endCopy.push(endSyns[j]);
					buildChain(startCopy, endCopy, allSynsCopy.slice(0));
				}
			}
		}
		
	}

	function sendData(chain) {
		var weight = 0;
		for (var i = 0; i < chain.length; i++) {
			console.log(chain[i].word);
			weight += chain[i].weight;
		}
		data.chain = chain;
		data.nodelimit = currentNodeNumber;
		data.synonymlevel = synonymLevel;
		data.weight = weight;
		data.attempts = attemptedChains;
		data.count = attemptCount;
		callback(null, data);
	}

	function getShortestChain() {
		if (currentNodeNumber < nodeNumberLimit) {
			currentNodeNumber++;
			var newAllSynsCopy = allSynonyms.slice(0);
			buildChain({word:startWord, weight:0}, [], newAllSynsCopy);
			if (!foundChain) getShortestChain();
		} else {
			callback("Your search has exceeded the capacity of the algorithm.  Please try a new search.");
		}
	}

	if (startWord && endWord) {
		if (regTest.test(startWord) && regTest.test(endWord)) {
			if (startWord != endWord) {
				if (thesaurus.find(startWord).length > 0) {
					if (thesaurus.find(endWord).length > 0) {
						var newAllSynsCopy = allSynonyms.slice(0);
						buildChain([{word:startWord, weight:0, syns:[]}], [{word:endWord, weight:0, syns:[]}], newAllSynsCopy);
						if (!foundChain) getShortestChain();
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