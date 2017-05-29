//needs to be global for callback
function initMap() {
  bps.dataService.getData().done(result => {
    drawMap(result);
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
  window.app = app;

  // test
  // var geocoder = new google.maps.Geocoder();
  // geocoder.geocode({'address': '184 Dudley Street, Roxbury, MA 02119'}, function(results, status) {
  //   if (status === 'OK') {
  //     app.filterByLocation(results[0], 1.5);
  //   } else {
  //     alert('Geocode was not successful for the following reason: ' + status);
  //   }
  // });
  // end test

  app.filter();
}

let App = class {
  constructor(assets, map) {
    this.assets = assets;
    this.map = map;
    this.parse(this.assets);
    this.currentMarkers = [];
    this.currentAssets = [];
    this.setupDom();
  }

  setupDom() {
    var that = this;

    this.autocomplete = new google.maps.places.Autocomplete(document.getElementById('places-input'));
    this.autocomplete.bindTo('bounds', this.map);
    this.autocomplete.addListener('place_changed', function () {
      that.handlePlaceInput();
    });

    $('#clear-address').click(() => {
      that.clearCurrentPlace();
    })

    this.categories.forEach(category => {
      $('#category-dropdown').append(`<option>${category}</option>`);
    });

    $('#category-dropdown').change(() => {
      that.filter();
    })

    $('#radius').change(() => { that.filter(); });

    $('#printout-button').click(() => { that.printCurrent(); });
  }

  handlePlaceInput() {
    this.currentPlace = this.autocomplete.getPlace();
    $('#current-address').html(this.currentPlace.formatted_address);
    $('#places-input').val('');
    $('#clear-address').show();
    this.filter();
  }

  clearCurrentPlace() {
    this.currentPlace = null;
    $('#current-address').html('None');
    $('#clear-address').hide();
    this.filter();
  }

  parse() {
    this.categories = [...new Set(this.assets.map(item => item.category))];
    window.foo = this.categories;
  }

  filter() {
    this.clearAssets();
    let categoryFiltered = this.filterByCategory(this.assets, $('#category-dropdown :selected').text());
    this.currentAssets = this.filterByLocation(categoryFiltered, this.autocomplete.getPlace(), $('#radius').val());
    this.plotAssets();
  }

  filterByCategory(assets, category) {
    if (this.currentCategory === category) {
      return assets;
    } else if (category === 'All') {
      return assets;
    } else {
      return assets.filter(asset => {
        return asset.category === category;
      });
    }
  }

  drawCircle (center, radius) {
    return new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: this.map,
      center: center,
      radius: radius
    });
  }

  filterByLocation(assets) {
    if (!this.currentPlace) {
      return assets;
    }
    let center = new google.maps.LatLng(
        this.currentPlace.geometry.location.lat(),
        this.currentPlace.geometry.location.lng()
    );
    let radius = getMeters($('#radius').val());
    this.currentCircle = this.drawCircle(center, radius);
    return assets.filter(asset => {
      let point = new google.maps.LatLng(asset.lat, asset.lng);
      let distance = google.maps.geometry.spherical.computeDistanceBetween(center, point);
      return distance < radius;
    });
  }

  plotAssets() {
    this.currentAssets.forEach((asset) => {
      let marker = new google.maps.Marker({
        position: {
          lat: asset.lat,
          lng: asset.lng
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
    if (this.currentCircle) {
      this.currentCircle.setMap(null);
    }
    this.currentAssets = [];
    this.currentMarkers = [];
  }

  getInfoWindowDom(asset, isSchool) {
    if (isSchool) {
      return '';
    } else {
      return `
        <div class="info-window">
          <h3>${asset.organization}</h3>
          <table class="table">
            <tr><td>Address </td><td> ${asset.address}</td></tr>
            <tr><td>Website </td><td> ${asset.website}</td></tr>
            <tr><td>Phone </td><td> ${asset.phone}</td></tr>
            <tr><td>Fax	</td><td> ${asset.fax}</td></tr>
            <tr><td>Email	</td><td> ${asset.email}</td></tr>
            <tr><td>Languages	</td><td> ${asset.languages}</td></tr>
            <tr><td>Information </td><td> ${asset.information}</td></tr>
            <tr><td>Category </td><td> ${asset.category}</td></tr>
          </table>
        </div>
      `;
    }
  }

  printCurrent() {
    let dom = '';
    this.currentAssets.forEach(asset => {
      dom += this.getInfoWindowDom(asset, false);
    }, this);
    let newTab = window.open('', '');
    newTab.document.write(dom);
    newTab.document.close();
  }
}
