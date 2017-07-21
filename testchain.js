var program = require('commander');
var chain = require('./chain');
var shortChain = require('./shortChain');
var twoChain = require('./twoChain');
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

function callRegularChain() {
	var startTime = now();
	chain.makeChain(query, [], function(err, data) {
		if (err) console.log(err);
		else {
			var endTime = now();
			console.log("");
			console.log(" -- original flavor -- ");
			console.log("time: ", (endTime-startTime).toFixed(3));
			console.log("attempts: ", data.attempts.length);
			console.log("nodes: ", data.nodelimit);
			process.stdout.write(query.start + " ");
			for (var i = 0; i < data.path.length; i++) {
				process.stdout.write(data.path[i].node.word + " ");
				process.stdout.write(data.path[i].node.weight + " ");
			}
			console.log("");
			callShortChain();
		}
	});
}

function callShortChain() {
	var startTime = now();
	shortChain.makeChain(query, [], function(err, data) {
		if (err) console.log(err);
		else {
			var endTime = now();
			console.log("");
			console.log(" -- shortest chain -- ");
			console.log("time: ", (endTime-startTime).toFixed(3));
			console.log("attempts: ", data.attempts.length);
			console.log("nodes: ", data.nodelimit);
			process.stdout.write(query.start + " ");
			for (var i = 0; i < data.chain.length; i++) {
				process.stdout.write(data.chain[i].node.word + " ");
				process.stdout.write(data.chain[i].node.weight + " ");

			}
			console.log("");
			callTwoChain();
		}
	});
}

function callTwoChain() {
	var startTime = now();
	twoChain.makeChain(query, [], function(err, data) {
		if (err) console.log(err);
		else {
			var endTime = now();
			console.log("");
			console.log(" -- shortest chain -- ");
			console.log("time: ", (endTime-startTime).toFixed(3));
			console.log("attempts: ", data.attempts.length);
			console.log("nodes: ", data.nodelimit);
			for (var i = 0; i < data.chain.length; i++) {
				process.stdout.write(data.chain[i].word + " ");
				process.stdout.write(data.chain[i].weight + " ");

			}
			console.log("");
		}
	});
}

callTwoChain();

