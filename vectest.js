var w2v = require( 'word2vec' );
var program = require('commander');

program
	.version('0.0.1')
	.usage('<word>')
	.parse(process.argv);

w2v.loadModel('node_modules/word2vec/examples/fixtures/vectors.txt', function( error, model ) {
	//console.log(model.getVector(program.args[0]));
	//console.log(model.getVector(program.args[1]));
	console.log(model.similarity(program.args[0], program.args[1]));
});