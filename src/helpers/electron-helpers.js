import * as constants from '../constants';

export const isElectronModeEnabled = (
  process.env.REACT_APP_TYPE === constants.APP_MODES.electronApp
);
