const fs = require('fs');
const allData = JSON.parse(fs.readFileSync('./data.json','utf8'));
const locData = JSON.parse(fs.readFileSync('./data-with-locs.json','utf8'));

let matchedData = {"type":"FeatureCollection","features":[]}

let count = 1;
allData.forEach(d => {
  locData.forEach(l => {
    if(l.locStr.indexOf(d.Location) > -1) {
      let newObj = {};
      newObj.id = 'ArtInstall_'+count;
      newObj.type = 'Feature';
      newObj.geometry = {"type":"Point","coordinates":l.latlon[0]}
      newObj.properties = {
        category: "Completed Install",
        address: l.locStr,
        imgURL: 'https://www.findstreetart.com/art/'+d.Image,
        business: d['Business name'],
        artist: d['Artist name'],
        insta: d['IG handle'],
        contact: d['Other contact'],
        help: d['With help from']
      }
      matchedData.features.push(newObj)
      count++;
    }
  })
})

console.log(matchedData)

fs.writeFileSync('./entered-data.json',JSON.stringify(matchedData),'utf8')