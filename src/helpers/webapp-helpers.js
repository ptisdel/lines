import * as constants from '../constants';

export const isWebappModeEnabled = (
  process.env.REACT_APP_TYPE === constants.APP_MODES.webApp
);

export const loadLocalStorageData = ({ callback, defaultData }) => {
  const parsedData = JSON.parse(window.localStorage.getItem('data') || defaultData);
  callback(parsedData);
};

export const saveLocalStorageData = ({ data }) => {
  window.localStorage.setItem('data', data);
}
