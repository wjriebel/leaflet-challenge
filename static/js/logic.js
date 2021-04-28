// Create tile layers - map backgrounds
var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 10,
  id: "dark-v10",
  accessToken: API_KEY
});
var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 10,
  id: "light-v10",
  accessToken: API_KEY
});
var satMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 10,
  id: "satellite-v9",
  accessToken: API_KEY
});
var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 10,
    id: "outdoors-v11",
    accessToken: API_KEY
});
// Create basemap object for all layers - only one layer can be shown at a time
var baseMaps = {
  "Dark": darkMap,
  "Light": lightMap,
  "Satellite": satMap,
  "Outdoors": outdoorsMap,
}

// Initialize layer groups to use on map
var quakeMarkers = L.layerGroup();
var tectonicPlates = L.layerGroup();

// Create overlay object for layer control on map
var overlays = {
  "Markers": quakeMarkers,
  "Tectonics": tectonicPlates
}

// Create our map, giving it the streetmap and earthquakes layers to display on load
var myMap = L.map("mapid", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [satMap, quakeMarkers, tectonicPlates]
  });

// Add layer control to map - pass map layers
L.control.layers(baseMaps, overlays, {collapsed:false}).addTo(myMap);

// Define streetmap layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  }).addTo(myMap);

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";
var tectonicLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Function for setting color of quake by depth
function setColors(depth){
  if (depth <= 10) {
      return "#99ff66";
  } else if (depth <= 30){
      return "#ffff66";
  } else if (depth <= 50){
      return "#ffc266";
  } else if (depth <= 70){
      return "#ff9900";
  } else if (depth <= 90){
      return "#ff3333";
  } else {
      return "#cc0000";
  }};

// Perform a GET request to the query URL
// d3.json(queryUrl, function(data) {
//     // Once we get a response, send the data.features object to the createFeatures function
//     var featuresArray = data['features']
//     for(var i=0;i<featuresArray.length;i++){
//         var myCoordinates = featuresArray[i].geometry.coordinates;
//         var myMagnitude = featuresArray[i].properties.mag;
//         var myPlace = featuresArray[i].properties.place;
//         var myType = featuresArray[i].properties.type;
//         L.circle([myCoordinates[1],myCoordinates[0]],{
//             stroke: true,
//             fillOpacity: .40,
//             color: 'white',
//             weight: 0.5,
//             fillColor: 'yellow',
//             radius: myMagnitude*10000
//         }).bindPopup("<h3> Place:" + myPlace +
//         "</h3><hr><p> Magnitude:" + myMagnitude + myType + new Date(featuresArray[i].properties.time) + "</p>").addTo(myMap);  
//     }
//   });
d3.json(queryUrl, function(data){
  // Loop data to get coords/magnitude
  features=data.features
  for (var i=0; i<features.length; i++){
      var magnitude = features[i].properties.mag;
      var coordinates = features[i].geometry.coordinates;
      // Create markes and add to layer
      var markers = L.circleMarker([coordinates[1], coordinates[0]], {
          fillOpacity: 0.8,
          fillColor: setColors(coordinates[2]),
          color: "black",
          weight: 0.3,
          radius: magnitude *4
      }).addTo(quakeMarkers);

      // Add popup when circle clicked
      markers.bindPopup("<h2>" + features[i].properties.place + "</h2><hr><h4>" + "Magnitude Level: " + magnitude + 
      "<br>" + new Date(features[i].properties.time) + "<br>" + 
      "Location: [" + coordinates[1] + ", " + coordinates[1] + "]" + "</h4>");}

 // Create legend for map
 var legend = L.control({position: "bottomright"});
 legend.onAdd = function(){
     var div =  L.DomUtil.create("div", "info legend");
     var depth = ["<10", "10-30", "30-50", "50-70", "70-90", ">90"];
     var colors = ["#99ff66", "#ffff66", "#ffc266", "#ff9900", "#ff3333", "#cc0000"]
     var labels = [];
     // Insert legend to html
     div.innerHTML 
         labels.push(`<p style="background-color: #e6ffff"><b> EARTHQUAKE DEPTH (km) </b></p>`);
     depth.forEach(function(depth, i) {
         labels.push(`<ul style="background-color: ${colors[i]}">${depth} km </ul>`);
   });
   div.innerHTML += "<ul>" + labels.join("") + "</ul>";
   return div;
 };
   // Adding legend to the map
   legend.addTo(myMap);
});
  // Request geojson data for tectonic plates and add to map
d3.json(tectonicLink, function(data){
  L.geoJSON(data, {
      style: {
          color: "red",
          fillOpacity: 0 }
  }).addTo(tectonicPlates)
});
