var thesaurus = require('thesaurus');

function makeChain(query, allSynonyms, callback) {
	var startWord = query.start.toLowerCase();
	var endWord = query.end.toLowerCase();
	var regTest = /^[a-z]+$/;

	const nodeNumberLimit = 10; // no chains more than this number of nodes
	var currentNodeNumber = 1;
	const synonymLevel = query.synonymlevel;
	var foundChain = false;

	var data = {};
	var attemptedChains = [];
	var attemptCount = 0;

	function buildChain(word, chain, allSynsCopy) {
		allSynsCopy.push(word.word);
		var tempSyns = thesaurus.find(word.word);
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
				allSynsCopy.push(syn);
			}
		}

		if (synonyms.length > synonymLevel) {
			synonyms.splice(synonymLevel, synonyms.length - synonymLevel);
		}

		chain.push({
			node: word,
			synonyms: synonyms
		});

		if (synonyms.length > 0 && chain.length == currentNodeNumber)
			attemptedChains.push([]);

		for (var i = 0; i < synonyms.length; i++) {
			let syn = synonyms[i];
			if (syn.word == endWord) {
				chain.push({
					node: syn
				});
				foundChain = true;
				sendData(chain);
			} else {
				if (chain.length < currentNodeNumber && !foundChain) {
					var newChain = chain.slice(0);
					buildChain(syn, newChain, allSynsCopy);
				} else if (chain.length == currentNodeNumber && !foundChain) {
					// getting data for vizuals
					var attempt = [];
					var attemptWeight = 0;
					for (let j = 0; j < chain.length; j++) {
						attempt.push(chain[j].node.word);
						attemptWeight += chain[j].node.weight;
					}
					attempt.push(syn.word);
					attemptWeight += syn.weight;
					attemptedChains[attemptedChains.length-1].push({attempt:attempt, weight:attemptWeight});
					attemptCount++;					
				}	
			}
		}
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

	if (startWord && endWord) {
		if (regTest.test(startWord) && regTest.test(endWord)) {
			if (startWord != endWord) {
				if (thesaurus.find(startWord).length > 0) {
					if (thesaurus.find(endWord).length > 0) {
						var allSynsCopy = allSynonyms.slice(0);
						buildChain({word:startWord, weight:0}, [], allSynsCopy);
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