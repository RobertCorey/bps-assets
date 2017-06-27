function pinSymbol(color) {
      var pinColor = color;
      pinColor = pinColor.substr(1);
    var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));
    var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
        new google.maps.Size(40, 37),
        new google.maps.Point(0, 0),
        new google.maps.Point(12, 35));
  return [pinImage, pinShadow];
}
let colors = ['#590000', '#332900', '#00cc36', '#7c92a6', '#660080', '#e51f00', '#f2e200', '#005947', '#00388c', '#d900ca', '#59332d', '#919926', '#30bfa3', '#000733', '#804073', '#592400', '#bfff40', '#00eeff', '#8091ff', '#d90074', '#d97736', '#d0ffbf', '#003c40', '#000080', '#bf8fa9', '#f2ba79', '#688060', '#b6eef2', '#000066', '#73002e', '#bfa98f', '#006600', '#2d98b3', '#464359', '#401023', '#ffaa00', '#005900', '#00aaff', '#3d00e6', '#bf0033', '#996600', '#0d3312', '#004d73', '#e1bfff', '#f27989'];

//needs to be global for callback

function initMap() {
  bps.dataService.getData().done(result => {
    bps.dataService.getCategories().done(categories => {
      drawMap({
        data: result,
        categories: categories
      });

    })
  })
}
function getMeters(miles) {
  return miles * 1609.344;
}

function drawMap(data) {
  var boston = {
    lat: 42.33894360169467,
    lng: -71.1169069898682
  };

  let assets = data.data;
  let categories = data.categories; 

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: boston
  });

  google.maps.Circle.prototype.contains = function(latLng) {
    return this.getBounds().contains(latLng) && google.maps.geometry.spherical.computeDistanceBetween(this.getCenter(), latLng) <= this.getRadius();
  }


  let app = new App(assets, map);

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
    console.log(colors.length);
    console.log(this.categories.length);
    this.currentAssets.forEach((asset) => {
      var z = this.categories.indexOf(asset.category);
      let foo = pinSymbol(colors[z % colors.length]);
      let a = foo[0];
      let b = foo[1];
      let marker = new google.maps.Marker({
        position: {
          lat: asset.lat,
          lng: asset.lng
        },
        map: this.map,
        icon: a,
        shadow: b,
        zIndex: z
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
