const {
  app, BrowserWindow, Menu, Tray,
} = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const isInstalling = require('electron-squirrel-startup');

if (isInstalling) return app.quit();

let mainWindow;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '../electron/icon.ico'),
    width: 400,
    height: 500,
    show: false,
    webPreferences: {
      spellcheck: false,
    },
  });
  const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startURL);

  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.on('close', event => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }

    return false;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.setMenu(null);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Lines',
      click() {
        mainWindow.show();
      },
    },
    {
      label: 'Quit',
      click() {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray = new Tray(path.join(__dirname, '../electron/icon.ico'));
  tray.setToolTip('Lines for Windows');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => mainWindow.show())
}

app.on('ready', createWindow);
