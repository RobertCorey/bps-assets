var jf = require('jsonfile');

  function normalizeData (assetObj) {
    function isEmpty(str) {
      return (!str || /^\s*$/.test(str));
    }
    return assetObj.assets.reduce((result, asset) => {
      if(!isEmpty(asset.MatchLatit)) {
        let transformed = {
          address: asset.Address_Te,
          lat: asset.MatchLatit,
          lng: asset.MatchLongi,
          organization: asset.Organizati,
          website: asset.Website,
          phone: asset.Phone_Numb,
          fax: asset.Fax,
          email: asset.Email,
          languages: asset.Languages,
          information: asset.Informatio,
          category: asset.Category
        }
        result.push(transformed);
      }
      return result;
    }, []);
  }

jf.readFile('./boston-main-assets.json',(err, obj) => {
  console.dir(obj);
  jf.writeFile('./boston-assets.json', normalizeData(obj));
});