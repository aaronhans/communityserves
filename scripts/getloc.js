const fs = require('fs');
const json = JSON.parse(fs.readFileSync('./data.json','utf8'));
const fetch = require('node-fetch');

let locMap = new Map();
let lookupCount = 0;
let output = [];

async function roll() {
  for(let i = 0;i<json.length;i++) {
    let item = json[i]
    let locStr = item.Location;
    if(locStr.toLowerCase().indexOf('oakland, ca') < 0) {
      locStr += ', Oakland, CA';
    }
    if(!locMap.get(locStr) && lookupCount < 100) {
      let featCallURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locStr)}.json?access_token=pk.eyJ1IjoiYWFyb25oYW5zIiwiYSI6ImNrYjVrc3hvaTBkMW4zMW1wbXU4emlhaHgifQ.3Zpqx654l58G4Fl_IdcXLA`;

      let geo = await fetch(featCallURL)
      let mapJSON = await geo.json();
      let latlon = '';
      if(mapJSON.features && mapJSON.features.length > 0) {
        latlon = [mapJSON.features[0].center];
      }
      locMap.set(locStr,{
        locStr, latlon
      })
      lookupCount++;
    }
  }
  console.log(locMap)
  locMap.forEach(loc => {
    output.push(loc)
  })
  console.log(output);
  fs.writeFileSync('./data-with-locs.json',JSON.stringify(output),'utf8')
}

roll()

