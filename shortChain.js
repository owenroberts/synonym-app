var thesaurus = require("thesaurus");

var makeChain = function(query, allSynonyms, callback) {
	var startWord = query.start.toLowerCase();
	var endWord = query.end.toLowerCase();
	var reg = /^[a-z]+$/;

	const nodeNumberLimit = 20; // no chains more than this number of nodes
	var currentNodeNumber = 1; // try to get under this first
	const synonymLevel = +query.synonymlevel;
	var foundChain = false;
	
	var data = {};
	var attemptedChains = [];
	var attemptCount = 0;

	function buildChain(chain, allSynsCopy) {
		var index = chain.length - 1;
		allSynsCopy.push(chain[index].word);
		var tempSyns = thesaurus.find(chain[index].word);
		var synonyms = [];
		for (var i = 0; i < tempSyns.length; i++) {
			if (reg.test(tempSyns[i]) 
				&& allSynsCopy.indexOf(tempSyns[i]) == -1 
				&& allSynsCopy.indexOf(tempSyns[i]+"s") == -1
				&& synonyms.length < 10 ) {
				synonyms.push({
					word:tempSyns[i],
					weight:i+1
				});
				allSynsCopy.push(tempSyns[i]);
			}
		}

		chain.synonyms = synonyms;

		for (var i = 0; i < synonyms.length; i++) {
			if (synonyms[i].word == endWord) {
			 	chain.push(synonyms[i]);
			 	foundChain = true;
			 	sendData(chain);
			} else  {
				if (chain.length < currentNodeNumber && !foundChain) {
					var newChain = chain.slice(0);
					newChain.push(synonyms[i]);
					buildChain(newChain, allSynsCopy.slice(0));
				} else if (chain.length == currentNodeNumber && !foundChain) {
					var attempt = [];
					var attemptWeight = 0;
					for (let j = 0; j < chain.length; j++) {
						attempt.push(chain[j]);
						attemptWeight += chain[j].weight;
					} 
					attempt.push(synonyms[i].word);
					attemptWeight += synonyms[i].weight;
					if (i == 0) 
						attemptedChains.push([]);
					attemptedChains[attemptedChains.length-1].push({attempt:attempt, weight:attemptWeight});
					attemptCount++;
				}
			}
		}
	}

	function sendData(chain) {
		var weight = 0;
		for (var i = 0; i < chain.length; i++) {
			weight += chain[i].weight;
		}
		data.avgWeight = weight/chain.length;
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
			if (!foundChain) {
				buildChain([{word:startWord, weight:0}], allSynonyms.slice(0));
				getShortestChain();
			}
		} else {
			callback("Your search was not able to be performed with the current parameters.");
		}
	}

	if (!startWord || !endWord) {
		callback("Please enter two search words.");
	} else if (!reg.test(startWord) || !reg.test(endWord)) {
		callback("Please enter single words with no spaces or dashes.");
	} else if (startWord == endWord) {
		callback("Please enter different words.")
	} else if (thesaurus.find(startWord).length == 0) {
		callback("The first word was not found.");
	} else if (thesaurus.find(endWord).length == 0) {
		callback("The second word was not found.");
	} else {
		buildChain([{word:startWord, weight:0}], allSynonyms.slice(0));
		getShortestChain();
	}

}
exports.makeChain = makeChain;