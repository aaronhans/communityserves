const addToGithub = require('./index.js');

  // art request: https://docs.google.com/spreadsheets/d/e/2PACX-1vTRun2moHUzxeAr4GjxtT9ONvGdjUyFqgR9NJHul3PXAJnteumrigM0p1rMJR7V6prl4mkTUaXiqhHm/pub?gid=1508614744&single=true&output=csv
  // clean up: https://docs.google.com/spreadsheets/d/e/2PACX-1vTRun2moHUzxeAr4GjxtT9ONvGdjUyFqgR9NJHul3PXAJnteumrigM0p1rMJR7V6prl4mkTUaXiqhHm/pub?gid=563594306&single=true&output=csv
  // complete cleanup: https://docs.google.com/spreadsheets/d/e/2PACX-1vTRun2moHUzxeAr4GjxtT9ONvGdjUyFqgR9NJHul3PXAJnteumrigM0p1rMJR7V6prl4mkTUaXiqhHm/pub?gid=390860791&single=true&output=csv
  // art installs: https://docs.google.com/spreadsheets/d/e/2PACX-1vTRun2moHUzxeAr4GjxtT9ONvGdjUyFqgR9NJHul3PXAJnteumrigM0p1rMJR7V6prl4mkTUaXiqhHm/pub?gid=698941003&single=true&output=csv

addToGithub('https://docs.google.com/spreadsheets/d/e/2PACX-1vTRun2moHUzxeAr4GjxtT9ONvGdjUyFqgR9NJHul3PXAJnteumrigM0p1rMJR7V6prl4mkTUaXiqhHm/pub?gid=1508614744&single=true&output=csv', 'Art Requests');
//addToGithub('https://docs.google.com/spreadsheets/d/e/2PACX-1vTRun2moHUzxeAr4GjxtT9ONvGdjUyFqgR9NJHul3PXAJnteumrigM0p1rMJR7V6prl4mkTUaXiqhHm/pub?gid=563594306&single=true&output=csv', 'Clean Up Requests');
// addToGithub('https://docs.google.com/spreadsheets/d/e/2PACX-1vTRun2moHUzxeAr4GjxtT9ONvGdjUyFqgR9NJHul3PXAJnteumrigM0p1rMJR7V6prl4mkTUaXiqhHm/pub?gid=390860791&single=true&output=csv', 'Clean Up Completes');
// addToGithub('https://docs.google.com/spreadsheets/d/e/2PACX-1vTRun2moHUzxeAr4GjxtT9ONvGdjUyFqgR9NJHul3PXAJnteumrigM0p1rMJR7V6prl4mkTUaXiqhHm/pub?gid=698941003&single=true&output=csv', 'Art Installs');