import { Loader } from 'google-maps';  // https://www.npmjs.com/package/google-maps

const options = {/* todo */ };
const loader = new Loader('AIzaSyDKVw9a51uhOzBwDZCJY__Aso8hjFC3_Sg', options);

function DecodeHtml(str) {
  return $('<div/>').html(str).text();
}

var GoogleMaps = (function () {
  function GoogleMaps() {
    var map_el = document.getElementById('map');
    var data_el = document.getElementById('map-data');
    var $tooltip = $("#map-tooltip");

    if (map_el && data_el) {
      loader.load().then(function (google) {
        var map = new google.maps.Map(map_el, {
          zoom: 3.25,
          disableDefaultUI: false,
          streetViewControl: false,
          mapTypeControl: false,
          styles: [{ "featureType": "all", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "all", "elementType": "labels.text", "stylers": [{ "visibility": "off" }] }, { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#ffffff" }] }, { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "visibility": "on" }, { "color": "#214875" }, { "weight": 2 }, { "gamma": 0.84 }] }, { "featureType": "all", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "weight": 0.6 }, { "color": "#2e65a3" }] }, { "featureType": "administrative", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "administrative", "elementType": "labels.text", "stylers": [{ "visibility": "off" }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#2b5f9b" }, { "visibility": "simplified" }] }, { "featureType": "landscape", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "landscape", "elementType": "labels.text", "stylers": [{ "visibility": "off" }] }, { "featureType": "landscape", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#406d80" }, { "visibility": "off" }] }, { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#214875" }, { "visibility": "simplified" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1a3a5d" }, { "lightness": -37 }, { "visibility": "simplified" }] }, { "featureType": "road", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#1f436c" }, { "visibility": "simplified" }] }, { "featureType": "transit", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#316db1" }] }]
        });

        var mapData = JSON.parse(data_el.innerHTML);

        var infowindow = new google.maps.InfoWindow({
          content: '',
        });

        google.maps.event.addListener(infowindow, 'domready', function () {
          var iwOuter = $('.gm-style-iw');
          var iwBackground = iwOuter.prev();
          iwBackground.children(':nth-child(2)').css({ 'display': 'none' });
          iwBackground.children(':nth-child(4)').css({ 'display': 'none' });
        });

        var bounds = new google.maps.LatLngBounds();

        mapData.forEach(function (datum) {
          var marker = new google.maps.Marker({
            position: datum.position,
            map: map,
            icon: "/Areas/CMS/assets/img/map_pin.png",
            url: datum.url
          });

          google.maps.event.addListener(marker, 'mouseover', function () {
            marker.setIcon("/Areas/CMS/assets/img/map_pin_active.png");
            infowindow.setContent(datum.title);
            infowindow.open(map, marker);
            //var iw_container = $(".gm-style-iw").parent();
            //iw_container.stop().hide();
            //iw_container.fadeIn(100);
          });

          google.maps.event.addListener(marker, 'mouseout', function () {
            marker.setIcon("/Areas/CMS/assets/img/map_pin.png");
            infowindow.close();

            //var iw_container = $(".gm-style-iw").parent();
            //iw_container.fadeOut(100, function () {
            //  infowindow.close();
            //});    
          });

          google.maps.event.addListener(marker, 'click', function () {
              window.location.href = this.url;   
          });

          bounds.extend(datum.position);
        });

        var center = bounds.getCenter();

        map.setCenter(new google.maps.LatLng(center.lat() + .35, center.lng()));
        map.setZoom(8);
      });
    }
  }

  return GoogleMaps;
}());

export default GoogleMaps;
