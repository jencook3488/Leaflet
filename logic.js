var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var boundariesUrl = "tectonicplates/GeoJSON/PB2002_boundaries.json";
var orogensUrl = "tectonicplates/GeoJSON/PB2002_orogens.json";
var platesUrl = "tectonicplates/GeoJSON/PB2002_plates.json";
var stepsUrl = "tectonicplates/GeoJSON/PB2002_steps.json";

// Perform a GET request to the query URL
d3.json(queryUrl, function(earthquakeData) {
  d3.json(boundariesUrl, function(boundariesData) {
    d3.json(orogensUrl, function(orogensData) {
      d3.json(platesUrl, function(platesData) {
        d3.json(stepsUrl, function(stepsData) {
          // Once we get a response, send the data.features object to the createFeatures function
          createFeatures(earthquakeData.features, boundariesData.features, orogensData.features, platesData.features, stepsData.features);
        });
      });
    });
  });
});

function createFeatures(earthquakeData, boundariesData, orogensData, platesData, stepsData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");  
  }

  var geojsonMarkerOptions = {
    radius: 20,
    fillColor: "green",
    stroke: false,
    fillOpacity: 0.4
  }
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      geojsonMarkerOptions.radius = feature.properties.mag * 3;
      geojsonMarkerOptions.fillColor = `hsl(${160 - feature.properties.mag * 40}, 100%, 50%)`;
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });

  var boundaries = L. geoJSON(boundariesData);
  var orogens = L.geoJSON(orogensData);
  var plates = L.geoJSON(platesData);
  var steps = L.geoJSON(stepsData);

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, boundaries, orogens, plates, steps);
}

function createMap(earthquakes, boundaries, orogens, plates, steps) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Satellite": satellite,
    "Outdoors": outdoors
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Boundaries: boundaries,
    Orogens: orogens,
    Plates: plates,
    Steps: steps
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 40, 80, 120, 160],
          labels = ["0", "1", "2", "3", "4"];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + `hsl(${160 - grades[i]}, 100%, 50%)` + '"></i> ' + 'Mag: ' + labels[i] + '<br><br>';
      }

      return div;
  };

  legend.addTo(myMap);
}