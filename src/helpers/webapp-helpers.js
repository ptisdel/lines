import * as constants from '../constants';

export const isWebappModeEnabled = constants.APP_MODE === constants.APP_MODES.webapp;

export const loadLocalStorageData = ({ callback, defaultData }) => {
  const parsedData = JSON.parse(window.localStorage.getItem('data') || defaultData);
  callback(parsedData);
};

export const saveLocalStorageData = ({ data }) => {
  window.localStorage.setItem('data', data);
}
