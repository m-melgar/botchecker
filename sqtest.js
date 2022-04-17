var dict = {};

var dictstring = JSON.stringify(dict);

var fs = require('fs');
fs.writeFile("./thing.json", dictstring, function(err, result) {
    if(err) console.log('error', err);
});