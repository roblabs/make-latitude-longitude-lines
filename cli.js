#!/usr/bin/env node

var data = {"type":"FeatureCollection","features":[]};
var featureTemplate = {"type":"Feature","properties":{},"geometry":{"type":"LineString","coordinates":[[-0,0],[0,0]]}};

var features = [];

var maxLatitude = 85.05115;
var minLatitude = -1.0 * maxLatitude;
var maxLongitude = 180.0;
var minLongitude = -1.0 * maxLongitude;
// interval is every 2.5 minutes
var minutesInterval = 2.0/60.0 + 30.0/3600;


/*
https://stackoverflow.com/a/8687635
*/
function getDD2DMS(dms, type){
    var sign = 1, Abs=0;
    var degrees, minutes, seconds, direction;

    if(dms < 0)  { sign = -1; }
    Abs = Math.abs( Math.round(dms * 1000000.));
    //Math.round is used to eliminate the small error caused by rounding in the computer:
    //e.g. 0.2 is not the same as 0.20000000000284
    //Error checks
    if(type == "lat" && Abs > (90 * 1000000)){
        //alert(" Degrees Latitude must be in the range of -90. to 90. ");
        return false;
    } else if(type == "lon" && Abs > (180 * 1000000)){
        //alert(" Degrees Longitude must be in the range of -180 to 180. ");
        return false;
    }

    degrees = Math.floor(Abs / 1000000);
    minutes = Math.floor(((Abs/1000000) - degrees) * 60);
    seconds = ( Math.floor((( ((Abs/1000000) - degrees) * 60) - minutes) * 100000) *60/100000 ).toFixed();

    // check if we should bump up the number of minutes
    if(seconds == 60){
      seconds = "00";
      minutes +=1;
    }

    degrees = degrees * sign;
    if(type == 'lat') direction = degrees<0 ? 'S' : 'N';
    if(type == 'lon') direction = degrees<0 ? 'W' : 'E';
    //else return value
    return (degrees * sign) + '° ' + minutes + "' " + seconds + "\" " + direction;
}

function setLatitude(latitude) {
  var feature = {"type":"Feature","properties":{},"geometry":{"type":"LineString","coordinates":[[-0,0],[0,0]]}};

  feature.properties.wgs84Degrees = getDD2DMS(latitude, "lat");

  var fixedString = latitude.toFixed(6);
  var fixedFloat = parseFloat(fixedString);
  feature.properties.wgs84Decimal = fixedString;

  feature.geometry.coordinates[0][0] = minLongitude;
  feature.geometry.coordinates[0][1] = fixedFloat;

  feature.geometry.coordinates[1][0] = maxLongitude;
  feature.geometry.coordinates[1][1] = fixedFloat;

  features.push(feature);
}

function setLongitude(longitude) {
  var feature = {"type":"Feature","properties":{},"geometry":{"type":"LineString","coordinates":[[-0,0],[0,0]]}};

  feature.properties.wgs84Degrees = getDD2DMS(longitude, "lon");

  var fixedString = longitude.toFixed(6);
  var fixedFloat = parseFloat(fixedString);
  feature.properties.wgs84Decimal = fixedString;

  feature.geometry.coordinates[0][0] = fixedFloat;
  feature.geometry.coordinates[0][1] = minLatitude;

  feature.geometry.coordinates[1][0] = fixedFloat;
  feature.geometry.coordinates[1][1] = maxLatitude;

  features.push(feature);
}

// Northern Hemisphere
var latitude = 0;
do {
  setLatitude(latitude);
  latitude += minutesInterval;
} while (latitude < maxLatitude);

// Southern Hemisphere
var latitude = 0;
do {
  setLatitude(latitude);
  latitude -= minutesInterval;
} while (latitude > minLatitude);

// Eastern Hemisphere
var longitude = 0;
do {
  setLongitude(longitude);
  longitude += minutesInterval;
} while (longitude < maxLongitude);

// Western Hemisphere
var longitude = 0;
do {
  setLongitude(longitude);
  longitude -= minutesInterval;
} while (longitude > minLongitude);

data.features = features;

console.log(JSON.stringify(data))
