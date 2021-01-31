require('dotenv').config();
const { execSync } = require('child_process');

const APP_TYPE = process.env.REACT_APP_TYPE;

/* eslint-disable no-console */
console.log(`App type detected as ${APP_TYPE}.`);

if (APP_TYPE === 'webApp') {
  console.log('Setting up app.');
  execSync('react-scripts start',
    { stdio: 'inherit' });
}
if (APP_TYPE === 'electron') {
  console.log('Setting up app.');
  execSync('set "BROWSER=none" && concurrently "react-scripts start" "wait-on http://localhost:3000 && electron ."',
    { stdio: 'inherit' });
}
if (APP_TYPE === 'chromeExtension') {
  console.log('Chrome extension has no dev script.');
}
/* eslint-enable no-console */
