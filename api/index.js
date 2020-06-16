const csv=require('csvtojson');
const fetch = require('node-fetch');
function authheader() {
  return {
    'Authorization' : `Bearer ${process.env["GITHUB_TOKEN"]}`,
    'Content-Type': 'application/json'
  };
}

const sha1 = require("sha1");
const githubApiContents = "contents/";
const githubApiMerges = "merges";
const githubApiBranches = "branches/";

const Base64 = {	
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",	
  encode: function (e) {	
    var t = "";	
    var n, r, i, s, o, u, a;	
    var f = 0;	
    e = Base64._utf8_encode(e);	
    while (f < e.length) {	
      n = e.charCodeAt(f++);	
      r = e.charCodeAt(f++);	
      i = e.charCodeAt(f++);	
      s = n >> 2;	
      o = ((n & 3) << 4) | (r >> 4);	
      u = ((r & 15) << 2) | (i >> 6);	
      a = i & 63;	
      if (isNaN(r)) {	
        u = a = 64;	
      } else if (isNaN(i)) {	
        a = 64;	
      }	
      t =	
        t +	
        this._keyStr.charAt(s) +	
        this._keyStr.charAt(o) +	
        this._keyStr.charAt(u) +	
        this._keyStr.charAt(a);	
    }	
    return t;	
  },	
  decode: function (e) {	
    var t = "";	
    var n, r, i;	
    var s, o, u, a;	
    var f = 0;	
    e = e.replace(/++[++^A-Za-z0-9+/=]/g, "");	
    while (f < e.length) {	
      s = this._keyStr.indexOf(e.charAt(f++));	
      o = this._keyStr.indexOf(e.charAt(f++));	
      u = this._keyStr.indexOf(e.charAt(f++));	
      a = this._keyStr.indexOf(e.charAt(f++));	
      n = (s << 2) | (o >> 4);	
      r = ((o & 15) << 4) | (u >> 2);	
      i = ((u & 3) << 6) | a;	
      t = t + String.fromCharCode(n);	
      if (u != 64) {	
        t = t + String.fromCharCode(r);	
      }	
      if (a != 64) {	
        t = t + String.fromCharCode(i);	
      }	
    }	
    t = Base64._utf8_decode(t);	
    return t;	
  },	
  _utf8_encode: function (e) {	
    e = e.replace(/\r\n/g, "n");	
    var t = "";	
    for (var n = 0; n < e.length; n++) {	
      var r = e.charCodeAt(n);	
      if (r < 128) {	
        t += String.fromCharCode(r);	
      } else if (r > 127 && r < 2048) {	
        t += String.fromCharCode((r >> 6) | 192);	
        t += String.fromCharCode((r & 63) | 128);	
      } else {	
        t += String.fromCharCode((r >> 12) | 224);	
        t += String.fromCharCode(((r >> 6) & 63) | 128);	
        t += String.fromCharCode((r & 63) | 128);	
      }	
    }	
    return t;	
  },	
  _utf8_decode: function (e) {	
    var t = "";	
    var n = 0;	
    var r = (c1 = c2 = 0);	
    while (n < e.length) {	
      r = e.charCodeAt(n);	
      if (r < 128) {	
        t += String.fromCharCode(r);	
        n++;	
      } else if (r > 191 && r < 224) {	
        c2 = e.charCodeAt(n + 1);	
        t += String.fromCharCode(((r & 31) << 6) | (c2 & 63));	
        n += 2;	
      } else {	
        c2 = e.charCodeAt(n + 1);	
        c3 = e.charCodeAt(n + 2);	
        t += String.fromCharCode(	
          ((r & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)	
        );	
        n += 3;	
      }	
    }	
    return t;	
  },	
};

const committer = {
  name: "artService",
  email: "aaronhans@gmail.com",
};
const authHeader = {
  Authorization: `Bearer ${process.env["GITHUB_TOKEN"]}`,
  "Content-Type": "application/json",
};

module.exports = async function addToGithub(url, type) {

  const defaultoptions = () => ({ method: "GET", headers: authHeader });

  const getOptions = (bodyJSON) => ({
    method: "PUT",
    headers: authHeader,
    body: JSON.stringify(bodyJSON),
  });
  
  let newFile, newJSON;
  let unMappables = [];
  await fetch(url)
    .then(response => response.text())
    .then(async data => {

      // Async / await usage
      let returnedData = await csv().fromString(data);

      newJSON = {
        "type": "FeatureCollection",
        "features": []
      }

      returnedData.forEach(item => {
        let feature = {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": []
          },
          "properties": {
            "category": type,
            "address": item["Street Address of Location"],
            "imgURL": item["Please upload photos of the exterior space you'd like painted."],
            "contact": {
              "name": item["Contact Name"],
              "phone": item["Phone Number"]
            },
            "createDate": item["Timestamp"]
          }
        }

        if(item['latlon']) {
          feature.geometry.coordinates = [item.latlon]
          newJSON.features.push(feature);
        } else {
          unMappables.push(feature)
        }
      })
      
      console.log(newJSON)
    });

  let githubBranch = "master";
  let githubApiUrl = "https://api.github.com/repos/aaronhans/communityserves/";
  let fileLocation = `public/data/${type.toLowerCase().replace(/ /g,'-')}.json`;
  
  const newURL = `${githubApiUrl}${githubApiContents}${fileLocation}?ref=${githubBranch}`;
  console.log(newURL)

  const existingFileResponse = await fetch(newURL, defaultoptions());
  const json = await existingFileResponse.json();

  const rawURL = `https://raw.githubusercontent.com/aaronhans/communityserves/master/${fileLocation}`;
  console.log('rawURL')
  console.log(rawURL)

  let rawFileResponse = await fetch(rawURL, defaultoptions());
  let rawjson = await rawFileResponse.json();

  console.log('this is what is there now')
  if(rawjson) {
    for(let i = 0;i<unMappables.length;i++) { // have to basic loop or it won't wait for await
      let feat =unMappables[i];
      if(feat.geometry.coordinates.length < 2) {

        // loop through rawjson first
        let found = false;
        rawjson.features.forEach(rawj => {
          if(rawj.properties.address === feat.properties.address) {
            console.log('writing from GH buddy')
            feat.geometry.coordinates = rawj.geometry.coordinates;
            newJSON.features.push(feat);
            found = true;
          }
        })
        if(!found) {
          let featCallURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(feat.properties.address)}.json?access_token=pk.eyJ1IjoiYWFyb25oYW5zIiwiYSI6ImNrYjVrc3hvaTBkMW4zMW1wbXU4emlhaHgifQ.3Zpqx654l58G4Fl_IdcXLA`;
          console.log('calling for '+featCallURL)
          let geo = await fetch(featCallURL)
          let mapJSON = await geo.json();
          console.log('got a RESPONSE')
          console.log(mapJSON)
          if(mapJSON.features && mapJSON.features.length > 0) {
            feat.geometry.coordinates = [mapJSON.features.center];
            newJSON.features.push(feat);
          }  
        }
      }
    }
  }
  newFile = JSON.stringify(newJSON)
  console.log(newFile)

  const base64 = Base64.encode(newFile);

  let body = {
    committer,
    branch: githubBranch,
    content: base64,
    sha: json.sha,
  };

  //ADD
  const newFilePath = `${fileLocation}`;
  body.message = `Update file ${newFilePath}`;

  console.log(`${githubApiUrl}contents/${newFilePath}`);

  fetch(`${githubApiUrl}contents/${newFilePath}`, getOptions(body))
    .then((res) => {
      console.log(res);
      console.log(`ADD Success: ${newFilePath}`);
    })
    .catch(async (res) => {
      console.log(res)
      console.log('fail')
    });
};
