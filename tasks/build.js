require('dotenv').config();
const { execSync } = require('child_process');

const APP_TYPE = process.env.REACT_APP_TYPE;

/* eslint-disable no-console */
console.log(`App type detected as ${APP_TYPE}.`);

if (APP_TYPE === 'webApp') {
  console.log('Building app.');
  execSync('react-scripts build',
    { stdio: 'inherit' });
}
if (APP_TYPE === 'electron') {
  console.log('Building app.');
  execSync('react-scripts build',
    { stdio: 'inherit' });
}
if (APP_TYPE === 'chromeExtension') {
  console.log('Building app.');
  execSync('set "INLINE_RUNTIME_CHUNK=false" && react-scripts build',
    { stdio: 'inherit' });
}
/* eslint-enable no-console */
