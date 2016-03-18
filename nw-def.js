var Wordnet = require('node-wordnet');
var wordnet = new Wordnet();
var sent = false;
var fuckingPointers = function(ptrs, syn, res, callback) {
    ptrs.forEach(function(ptr) {
        wordnet.get(ptr.synsetOffset, ptr.pos, function(data) {
            if (data.synonyms.indexOf(syn) != -1 ||
                data.lemma.includes(syn)) {
                if (!sent) callback({
                    gloss:res.gloss.split(";")[0],
                    pos: res.pos
                });
                sent = true;
                return;
            }
        });
    });
};

var findDef = function(word, syn, callback) {
    sent = false;
    wordnet.lookup(word, function(results) {
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            if (result.lemma == syn ||
                result.lemma.includes(syn)) {
                console.log("lmma");
                if (!sent) callback(null, {
                    gloss:result.gloss.split(";")[0],
                    pos: result.pos
                });
                sent = true;
                return;
            } else if (result.synonyms.indexOf(syn) != -1) {
                if (!sent) callback(null, {
                    gloss:result.gloss.split(";")[0],
                    pos: result.pos
                });
                sent = true;
                return;
            } else {
                fuckingPointers(result.ptrs, syn, result, function(pointerResult) {
                    callback(null, pointerResult);
                });
            }
        }
    });
}
exports.findDef = findDef;