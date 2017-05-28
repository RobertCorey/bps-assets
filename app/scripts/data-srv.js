let bps = bps || {};

let DataService = class {
  getData () {
    return $.get('../data/boston-main-assets.json').then(this.normalizeData);
  }

  normalizeData (assetObj) {
    return assetObj.assets.map(asset => {
      return {
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
    });
  }
};

bps.dataService = new DataService();
/**
  var foo = {
        "OBJECTID": 1,
        "Address_Te": "27 Newton St, Brighton, MA 02135",
        "Matched": "True",
        "Match_Scor": "10",
        "Match_Text": "27 Newton St, Brighton, MA 02135",
        "Match_Type": "Address",
        "Match_Id": 102313,
        "MatchXCoor": 747072.253795,
        "MatchYCoor": 2955193.432012,
        "MatchLatit": 42.35671,
        "MatchLongi": -71.16367,
        "Match_Code": "ADDRESS_EXACT,XY_IMPROVEMENT",
        "Organizati": "Acosta, Jacqueline",
        "Address": "27 Newton St Apt B, Brighton, MA 02135-1706",
        "Website": " ",
        "Phone_Numb": "617-787-1289",
        "Fax": " ",
        "Email": " ",
        "Languages": " ",
        "Informatio": "Family Childcare Provider",
        "Verified_": " ",
        "Category": "Child Care and Resources"
  }
*/
