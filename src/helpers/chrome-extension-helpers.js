import * as constants from '../constants';

export const isChromeModeEnabled = constants.APP_MODE === constants.APP_MODES.chromeExtension;

export const loadChromeStorageData = ({ callback, defaultData }) => {
  // eslint-disable-next-line no-undef
  chrome.storage.sync.get({ data: defaultData }, result => {
    const parsedData = JSON.parse(result.data);
    callback(parsedData.notes);
  });
}

export const saveChromeStorageData = ({ data }) => {
  // eslint-disable-next-line no-undef
  chrome.storage.sync.set({ data }, () => {});
};

export const listenToChromeStorageChanges = ({ callback, instanceId }) => {
  const listener = changes => {
    const parsedData = JSON.parse(changes?.data.newValue);
    const latestUpdaterId = parsedData.lastUpdaterId;
    if (latestUpdaterId !== instanceId) callback(parsedData)
  }
  /* eslint-disable no-undef */
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
  /* eslint-enable no-undef */
}
