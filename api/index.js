const csv=require('csvtojson');
const fetch = require('node-fetch');
function authheader() {
  return {
    'Authorization' : `Bearer ${process.env["GITHUB_TOKEN"]}`,
    'Content-Type': 'application/json'
  };
}

const getOptions = (bodyJSON) => ({
  method: "PUT",
  headers: authHeader,
  body: JSON.stringify(bodyJSON),
});

const sha1 = require("sha1");
const githubApiContents = "contents/";
const githubApiMerges = "merges";
const githubApiBranches = "branches/";

const committer = {
  name: "artService",
  email: "aaronhans@gmail.com",
};
const authHeader = {
  Authorization: `Bearer ${process.env["GITHUB_TOKEN"]}`,
  "Content-Type": "application/json",
};
const defaultoptions = () => ({ method: "GET", headers: authHeader });

module.exports = async function addToGithub() {

  // art request: https://docs.google.com/spreadsheets/d/e/2PACX-1vTRun2moHUzxeAr4GjxtT9ONvGdjUyFqgR9NJHul3PXAJnteumrigM0p1rMJR7V6prl4mkTUaXiqhHm/pub?gid=1508614744&single=true&output=csv
  let newFile;
  await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTRun2moHUzxeAr4GjxtT9ONvGdjUyFqgR9NJHul3PXAJnteumrigM0p1rMJR7V6prl4mkTUaXiqhHm/pub?gid=1508614744&single=true&output=csv')
    .then(response => response.text())
    .then(async data => {

      // Async / await usage
      let returnedData = await csv().fromString(data);

      let newJSON = {
        "type": "FeatureCollection",
        "features": []
      }

      returnedData.forEach(item => {
        let feature = {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [-122.274688, 37.797367]
          },
          "properties": {
            "title": "Art Request",
            "address": item["Street Address of Location"]
          }
        }
        newJSON.features.push(feature);
      })
      
      console.log(newJSON)
      newFile = JSON.stringify(newJSON)
      console.log(newFile)
    });

  let githubBranch = "master";
  let githubApiUrl = "https://api.github.com/repos/aaronhans/communityserves/";
  let fileLocation = 'public/data/art-requests-test.json';

  const newURL = `${githubApiUrl}${githubApiContents}${fileLocation}?ref=${githubBranch}`;
  console.log(newURL)

  const existingFileResponse = await fetch(newURL, defaultoptions());

  // if (existingFileResponse.ok) {
    //update
    const json = await existingFileResponse.json();

    let body = {
      committer,
      branch: githubBranch,
      content: newFile.toString('base64'),
      sha: json.sha,
    };

    //ADD
    const newFilePath = `${fileLocation}`;
    body.message = `Update file ${newFilePath}`;

    console.log(getOptions(body));
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
  /*} else {
    console.log('fail')
  }*/
};
