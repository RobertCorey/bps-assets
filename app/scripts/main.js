var dataRequest = $.get('../data/boston-main-assets.json');
//needs to be global for callback
function initMap() {
  dataRequest.done(result => {
    drawMap(result.assets)
  })
}

function getMeters(miles) {
  return miles * 1609.344;
}

function drawMap(assets) {
  var boston = {
    lat: 42.33894360169467,
    lng: -71.1169069898682
  };

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: boston
  });

  google.maps.Circle.prototype.contains = function(latLng) {
    return this.getBounds().contains(latLng) && google.maps.geometry.spherical.computeDistanceBetween(this.getCenter(), latLng) <= this.getRadius();
  }


  let app = new App(assets, map);
  app.categories.forEach(category => {
    $('#category-dropdown').append(`<option>${category}</option>`);
  });

  $('#category-dropdown').change(() => {
    app.filterByCategory($('#category-dropdown :selected').text());
  })

  var autocomplete = new google.maps.places.Autocomplete(document.getElementById('places-input'));
  autocomplete.bindTo('bounds', map);
  autocomplete.addListener('place_changed', function () {
    var place = autocomplete.getPlace();
    console.log(place);
    app.filterByLocation(place);
  });
  // test
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({'address': '184 Dudley Street, Roxbury, MA 02119'}, function(results, status) {
    if (status === 'OK') {
      app.filterByLocation(results[0]);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
  // end test

  window.autocomplete = autocomplete;
  app.plotAssets();
}

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

  drawCircle (center, radius) {
    var cityCircle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: this.map,
      center: center,
      radius: getMeters(radius)
    });
  }

  filterByLocation(place, radius) {
    this.drawCircle({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      }, 1);
    return true;
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

      let infoWindow = new google.maps.InfoWindow({
        content: this.getInfoWindowDom(asset, false)
      })

      marker.addListener('click', () => {
        if (this.currentInfoWindow) {
          this.currentInfoWindow.close();
        }
        infoWindow.open(this.map, marker);
        this.currentInfoWindow = infoWindow;
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
  getInfoWindowDom(asset, isSchool) {
    if (isSchool) {
      return '';
    } else {
      return `
        <div class="info-window">
          <h3>${asset.Organizati}</h3>
          <table class="table">
            <tr><td>Address</td><td> ${asset.Address_Te}</td></tr>
            <tr><td>Website</td><td> ${asset.Website}</td></tr>
            <tr><td>Phone</td><td> ${asset.Phone_Numb}</td></tr>
            <tr><td>Fax	</td><td> ${asset.Fax}</td></tr>
            <tr><td>Email	</td><td> ${asset.Email}</td></tr>
            <tr><td>Languages	</td><td> ${asset.Languages}</td></tr>
            <tr><td>Information</td><td> ${asset.Informatio}</td></tr>
            <tr><td>Category</td><td> ${asset.Category}</td></tr>
          </table>
        </div>
      `;
    }
  }
}
