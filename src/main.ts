import { app, BrowserWindow, ipcMain } from 'electron';

declare const MAIN_WEBPACK_ENTRY: string;
declare const MAIN_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) {
    app.quit();
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit();
} else {
    app.on('ready', async () => {
        const app = new BrowserWindow({
            autoHideMenuBar: true,
            webPreferences: {
                preload: MAIN_PRELOAD_WEBPACK_ENTRY,
            },
            frame: false,
            show: false
        });
        app.loadURL(MAIN_WEBPACK_ENTRY);
        // browser.webContents.openDevTools();
        app.webContents.on('dom-ready', () => app.webContents.send(app.isMaximized() ? 'maximize' : 'unmaximize'))

        ipcMain.handle('main-minimize', () => app.minimize());
        ipcMain.handle('main-close', () => app.close());
        ipcMain.handle('main-toggle-maximize', () => app.isMaximized() ? app.unmaximize() : app.maximize());
        app.on('maximize', () => app.webContents.send('maximize'));
        app.on('unmaximize', () => app.webContents.send('unmaximize'));
        app.show()

        ipcMain.handle('log', (e, ...args) => console.log(...args));
    });
}
