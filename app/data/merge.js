var jf = require('jsonfile');
var a = jf.readFileSync('./coords.json').array;
var b = jf.readFileSync('./boston-assets.json');
console.log(a.length);
console.log(b.length);
jf.writeFileSync('merged.json' , a.concat(b));