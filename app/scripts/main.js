var dataRequest = $.get('../data/boston-main-assets.json');
//needs to be global for callback
function initMap() {
  dataRequest.done(result => {
    drawMap(result.assets)
  })
}


function drawMap(assets) {
  var boston = {
    lat: 42.361145,
    lng: -71.057083
  };

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: boston
  });
  let app = new App(assets, map);
  app.categories.forEach(category => {
    $('#category-dropdown').append(`<option>${category}</option>`);
  });

  $('#category-dropdown').change(() => {
    app.filterByCategory($('#category-dropdown :selected').text());
  })

  app.plotAssets();
  window.app = app;
}
/**
 * "OBJECTID": 1,
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
 */
let App = class {
  constructor(assets, map) {
    this.assets = assets;
    this.map = map;
    this.parse(this.assets);
    this.currentMarkers = [];
  }

  parse(assets) {
    this.categories = [...new Set(this.assets.map(item => item.Category))];
  }

  filterByCategory(category) {
    console.log(category);
    if (this.currentCategory === category) {
      return;
    } else if (category === 'All') {
      this.plotAssets();
    } else {
      this.clearAssets();
      this.plotAssets(this.assets.filter(asset => {
        return asset.Category === category;
      }));
    }
  }

  plotAssets(assets) {
    assets = assets ? assets : this.assets;
    assets.forEach((asset) => {

      let marker = new google.maps.Marker({
        position: {
          lat: asset.MatchLatit,
          lng: asset.MatchLongi
        },
        map: this.map,
      });

      this.currentMarkers.push(marker);
    });
  }

  clearAssets() {
    this.currentMarkers.forEach(marker => {
      marker.setMap(null);
    });
    this.currentMarkers = [];
  }
}
