var program = require('commander');
program
  .version('0.0.1')
  .usage('<word>')
  .parse(process.argv);
var thesaurus = require("thesaurus");
var word = program.args[0];
var reg = /^[a-z]+$/;
/*if (thesaurus.find(word).length > 0) console.log("yes");
else console.log("no");*/
var syns = thesaurus.find(word);
console.log(syns);
syns.forEach(function(syn) {
	// if (reg.test(syn)) console.log(syn);
});
