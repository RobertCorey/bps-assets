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
}
