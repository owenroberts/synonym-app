var program = require('commander');
var def = require('./nw-def');

program
	.version('0.0.1')
	.usage('<word>')
	.parse(process.argv);

var word = program.args[0];
var syn = program.args[1];

if (!word) {
	program.help();
}

def.findDef(word, syn, function(err, definition) {
	if (err) query.error = err;
	else {
		console.log(definition);
	}
});
