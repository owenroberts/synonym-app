var w2v = require( 'word2vec' );

w2v.loadModel( 'node_modules/word2vec/examples/fixtures/vectors.txt', function( error, model ) {
	console.log(model.getVector("fart"));
	console.log(model.similarity('the', 'her'));
});