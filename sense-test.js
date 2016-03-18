var program = require('commander');
var Wordnet = require('node-wordnet');
var wordnet = new Wordnet();

program
	.version('0.0.1')
	.usage('<word>')
	.parse(process.argv);

var word = program.args[0];
var syn = program.args[1];

if (!word) {
	program.help();
}

wordnet.lookup(word, function(results) {
	for (var i = 0; i < results.length; i++) {
       	var result = results[i];
       	console.log(result.lemma, result.pos);
        wordnet.querySense(result.lemma, function(data) {
        	console.log(data);
        });
    }
});


/* issues 

light, dark
aerated - ventilated = related to "aerate" can't get sense with different ending
adj to v
injured burned = save adj to v
dark achromatic = no fing idea




*/