import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import './styles.css';
import * as helpers from './helpers';

const { isChromeModeEnabled } = helpers.chromeExtension;

ReactDOM.render(
  <React.StrictMode>
    { /* styles that only apply to chrome extension version */ }
    { isChromeModeEnabled && <link rel="stylesheet" href="./chrome-extension-styles.css" />}
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
