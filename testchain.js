var program = require('commander');
var chain = require('./chain');
var shortChain = require('./shortChain');
var twoChain = require('./twoChain');
var twoChainTwo = require('./twoChainTwo');
var now = require('performance-now');

program
	.version('0.0.1')
	.usage('<word>')
	.parse(process.argv);

var query = {
	start: program.args[0],
	end: program.args[1],
	nodelimit: 10,
	synonymlevel: 10
};

function runChain(data, startTime, type) {
	var endTime = now();
	console.log("");
	console.log(" -- " + type + " -- ");
	console.log("time: ", (endTime-startTime).toFixed(3));
	console.log("attempts: ", data.count);
	console.log("nodes: ", data.chain.length);
	console.log("total weight: ", data.weight, "average weight: ", data.avgWeight);
	for (var i = 0; i < data.chain.length; i++) {
		process.stdout.write(data.chain[i].word + " ");
		process.stdout.write(data.chain[i].weight + " ");
	}
	console.log("");
}

// var startTime = now();
// chain.makeChain(query, [], function(err, data) {
// 	if (err) console.log(err);
// 	else runChain(data, startTime, "original flavor");
// });

// startTime = now();
// shortChain.makeChain(query, [], function(err, data) {
// 	if (err) console.log(err);
// 	else runChain(data, startTime, "shortest chain");
// });

// startTime = now();
// twoChain.makeChain(query, [], function(err, data) {
// 	if (err) console.log(err);
// 	else runChain(data, startTime, "two way chain");
// });

startTime = now();
twoChainTwo.makeChain(query, [], function(err, data) {
	if (err) console.log(err);
	else runChain(data, startTime, "two way TWO");
});