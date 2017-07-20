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
		for (var i = 0; i < tempSyns.length; i++) {
			let syn = tempSyns[i];
			if (regTest.test(syn)
				&& allSynsCopy.indexOf(syn) == -1
				&& allSynsCopy.indexOf(syn+"s") == -1
				&& synonyms.length < 10) {
				synonyms.push({
					word: syn,
					weight: i + 1
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
		var startSyns = getSynonyms(startChain[currentStartIndex].word, allSynsCopyCopy);
		var endSyns = getSynonyms(endChain[currentEndIndex].word, allSynsCopyCopy);
		startChain[currentStartIndex].syns.push( startSyns );
		endChain[currentStartIndex].syns.push( endSyns );
		allSynsCopy.push( startSyns );
		allSynsCopy.push( endSyns );

		if (startSyns.length + endSyns.length > 0 && startChain.length + endChain.length >= currentNodeNumber)
			attempts.push([]);

		for (let i = 0; i < startSyns.length; i++) {
			for (let j = 0; j < endSyns.length; j++) {
				if (startSyns[i] == endSyns[j]) {
					foundChain = true;
					for (let h = endSyns.length - 1; h == 0; h--) {
						startChain.push( endChain[h] );
					}
					sendData(startChain);
				} else if (startChain.length + endChain.length < currentNodeNumber && !foundChain) {
					buildChain(startChain.slice(0), endChain.slice(0), allSynsCopy.slice(0));
				} else if (startChain.length + endChain.length >= currentNodeNumber && !foundChain) {
					attemptCount++;
				}
			}
		}
		
	}

	function sendData(chain) {
		var weight = 0;
		for (var i = 0; i < chain.length; i++) {
			weight += chain[i].node.weight;
		}
		var finalChain = [];
		for (var i = 1; i < chain.length; i++) {
			finalChain[i - 1] = {};
			finalChain[i - 1].node = chain[i].node;
			finalChain[i - 1].alternates = chain[i-1].synonyms;
		}
		data.chain = finalChain;
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