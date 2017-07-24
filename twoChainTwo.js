var thesaurus = require('thesaurus');

function makeChain(query, allSynonyms, callback) {
	var startWord = query.start.toLowerCase();
	var endWord = query.end.toLowerCase();
	var reg = /^[a-z]+$/;

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
			if (reg.test(syn)
				&& allSynsCopy.indexOf(syn) == -1
				&& allSynsCopy.indexOf(syn+"s") == -1
				&& synonyms.length < 10) {
				synonyms.push({
					word: syn,
					weight: i + 1
				});
			}
		}
		return synonyms;
	}

	function buildChain(startChain, endChain, allSynsCopy) {
		var startIndex = startChain.length-1;
		var endIndex = endChain.length-1;
		allSynsCopy.push(startChain[startIndex].word);
		allSynsCopy.push(endChain[endIndex].word);
		for (let i = 0; i < startChain[startIndex].synonyms.length; i++) {
			let startCopy = startChain.slice(0);
			let startSyn = startChain[startIndex].synonyms[i];
			allSynsCopy.push(startSyn.word);
			for (let j = 0; j < endChain[endIndex].synonyms.length; j++) {
				let endSyn = endChain[endIndex].synonyms[j];
				allSynsCopy.push(endSyn.word);
				if (startSyn.word == endSyn.word && !foundChain) {
					foundChain = true;
					for (let h = endChain.length-1; h > 0; h--) {
						startCopy.push( endChain[h] );
					}
					sendData(startCopy);
				} else if (startChain.length + endChain.length < currentNodeNumber && !foundChain) {
					logChains(startChain, endChain);
					startSyn.synonyms = getSynonyms(startSyn.word, allSynsCopy.slice(0));
					startCopy.push(startSyn);
					buildChain(endChain.slice(0), startCopy, allSynsCopy.slice(0));
				} else if (startChain.length + endChain.length >= currentNodeNumber && !foundChain) {
					
					attemptCount++;
				}
			}
		}
	}

	function logChains(startChain, endChain) {
		for (let s = 0; s < startChain.length; s++)
			process.stdout.write(startChain[s].word + " ");
		process.stdout.write("- ");
		for (let e = 0; e < endChain.length; e++)
			process.stdout.write(endChain[e].word + " ");
		console.log("");		
	}

	function sendData(chain) {
		let weight = 0;
		for (let i = 0; i < chain.length; i++) {
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
				buildChain(
					[{word:startWord, weight:0}], 
					[{word:endWord, weight:0}], 
					allSynonyms.slice(0)
				);
				getShortestChain();
			}
		} else {
			callback("Your search has exceeded the capacity of the algorithm.  Please try a new search.");
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
		//console.log( getSynonyms(startWord, allSynonyms.slice(0)) );
		allSynonyms.push(startWord);
		allSynonyms.push(endWord);
		buildChain(
			[{word:startWord, weight:0, synonyms: getSynonyms(startWord, allSynonyms.slice(0))}], 
			[{word:endWord, weight:0, synonyms: getSynonyms(endWord, allSynonyms.slice(0))}], 
			allSynonyms.slice(0)
		);
		getShortestChain();
	}
}

exports.makeChain = makeChain;