//needs to be global for callback
let categories = {
  "categories": [{
      "name": "Child Care and Resources",
      "icon": "child_care.png"
    },
    {
      "name": "Community Center",
      "icon": "business.png"
    },
    {
      "name": "Disabilities & Special Needs",
      "icon": "accessible.png"
    },
    {
      "name": "Early Childhood Support",
      "icon": "pregnant_woman.png"
    },
    {
      "name": "Early Intervention",
      "icon": "pan_tool.png"
    },
    {
      "name": "Family Support",
      "icon": "group.png"
    },
    {
      "name": "Health",
      "icon": "spa.png"
    },
    {
      "name": "Homelessness",
      "icon": "airline_seat_flat.png"
    },
    {
      "name": "Housing & Financial Counseling",
      "icon": "home.png"
    },
    {
      "name": "Immigrant Services",
      "icon": "public.png"
    },
    {
      "name": "Libraries",
      "icon": "local_library.png"
    },
    {
      "name": "Media",
      "icon": "chrome_reader_mode.png"
    },
    {
      "name": "Mental Health",
      "icon": "local_hospital.png"
    },
    {
      "name": "Municipal Agency",
      "icon": "local_mall.png"
    },
    {
      "name": "Recreation",
      "icon": "nature_people.png"
    },
    {
      "name": "Religious Institution",
      "icon": "all_inclusive.png"
    },
    {
      "name": "Schools",
      "icon": "school.png"
    },
    {
      "name": "Senior Services",
      "icon": "cake.png"
    },
    {
      "name": "Social Services",
      "icon": "weekend.png"
    },
    {
      "name": "Substance Abuse",
      "icon": "healing.png"
    },
    {
      "name": "Youth Services",
      "icon": "child_friendly.png"
    }
  ]
};

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
    zoom: 14,
    center: boston
  });

  for (var key in assets) {
    if (assets.hasOwnProperty(key)) {
      var element = assets[key];
      assets[key].icon = categories.categories.filter((category) => {
        return element.category === category.name;
      })[0].icon;
    }
  }

  console.log(assets);
  google.maps.Circle.prototype.contains = function(latLng) {
    return this.getBounds().contains(latLng) && google.maps.geometry.spherical.computeDistanceBetween(this.getCenter(), latLng) <= this.getRadius();
  }


  let app = new App(assets, map);
  window.app = app;

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
      var z = this.categories.indexOf(asset.category);
      let marker = new google.maps.Marker({
        position: {
          lat: asset.lat,
          lng: asset.lng
        },
        map: this.map,
        icon: '/images/icons/' + asset.icon,
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
