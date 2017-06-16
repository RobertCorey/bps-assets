//Converter Class
var Converter = require("csvtojson").Converter;
var fs=require("fs");
var rp = require('request-promise');
var jf = require('jsonfile');

//CSV File Path or CSV String or Readable Stream Object
var csvFileName="./new-assets.csv";
function getCoords (address) {
  let base = 'https://maps.googleapis.com/maps/api/geocode/json?address='
  base += address.replace(' ', '+');
  base += '&key=AIzaSyBgzVY-chPD4EZIDc2oj8hec2hXFYFm4og';

  return rp.get(base).then((resp) => {

    let coord = JSON.parse(resp).results[0].geometry.location;
    return {
      address: address,
      lat: coord.lat,
      lng: coord.lng
    };
  }).catch(() => {
     return {
      address: address,
    };
  });
}
var csvConverter=new Converter({});
var coords = [];
csvConverter.on("end_parsed",function(jsonObj){
  for (var key in jsonObj) {
    if (jsonObj.hasOwnProperty(key)) {
      var element = jsonObj[key];
      coords.push(getCoords(element.address))
    }
  }
  Promise.all(coords).then(res => {
    jf.writeFile('coords.json', {array: res});
  })
});

//read from file
fs.createReadStream(csvFileName).pipe(csvConverter);