const fs = require('fs');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminWebp = require('imagemin-webp');
const path = require("path");
const move = require("move-concurrently");
const csv=require('csvtojson')
const csvFilePath='./oakland-murals.csv';
let directoryPath = __dirname+'/clean-filenames/';

let matches = [];
csv()
.fromFile(csvFilePath)
.then(async (jsonObj)=>{
  let files = fs.readdirSync(directoryPath);
  
  for(let i = 0;i<files.length;i++) {
    let file = files[i];
    for(let g = 0;g<jsonObj.length;g++) {
      let line = jsonObj[g]
      
      if(file.indexOf(line.Image) > -1) {
        line.Image = file;
        matches.push(line);
        console.log('matched')
      }
    }
  }
  
  console.log(matches)
  fs.writeFileSync('./data.json',JSON.stringify(matches),'utf8')
})

// do the lat,lon lookups on the addresses

