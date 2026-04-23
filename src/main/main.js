const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const Store = require('electron-store');
const fileService = require('./fileService');

const store = new Store({
  defaults: {
    lastFolder: null,
    theme: 'light',
    bookmarks: [],
    recentFolders: []
  }
});

let mainWindow = null;
let selectedFolder = null;

function getPreloadPath() {
  return path.join(__dirname, 'preload.js');
}

function createWindow() {
  const preloadPath = getPreloadPath();

  if (!fs.existsSync(preloadPath)) {
    console.error(`[OwnMD main] Preload script not found: ${preloadPath}`);
  } else {
    console.info(`[OwnMD main] Loading preload script: ${preloadPath}`);
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.webContents.on('preload-error', (event, preload, error) => {
    console.error(`[OwnMD main] Preload failed: ${preload}`, error);
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[OwnMD renderer:${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`[OwnMD main] Failed to load ${validatedURL}: ${errorCode} ${errorDescription}`);
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, error: 'No folder selected' };
  }

  selectedFolder = result.filePaths[0];
  store.set('lastFolder', selectedFolder);

  // Update recent folders
  updateRecentFolders(selectedFolder);

  const files = fileService.scanMarkdownFiles(selectedFolder);
  return { success: true, folderPath: selectedFolder, files };
});

function updateRecentFolders(folderPath) {
  let recent = store.get('recentFolders') || [];
  recent = recent.filter(f => f !== folderPath);
  recent.unshift(folderPath);
  recent = recent.slice(0, 5);
  store.set('recentFolders', recent);
}

ipcMain.handle('read-file', async (event, filePath) => {
  if (!selectedFolder) {
    return { success: false, error: 'No folder selected' };
  }

  const result = fileService.readMarkdownFile(filePath, selectedFolder);
  return result;
});

ipcMain.handle('get-theme', () => {
  return { theme: store.get('theme') };
});

ipcMain.handle('set-theme', (event, theme) => {
  store.set('theme', theme);
  return { theme };
});

ipcMain.handle('search-files', async (event, query) => {
  if (!selectedFolder) return { success: false, error: 'No folder selected' };
  const results = fileService.searchMarkdownFiles(query, selectedFolder);
  return { success: true, results };
});

ipcMain.handle('get-bookmarks', () => {
  return store.get('bookmarks') || [];
});

ipcMain.handle('toggle-bookmark', (event, filePath, fileName) => {
  const bookmarks = store.get('bookmarks') || [];
  const exists = bookmarks.find(b => b.filePath === filePath);
  if (exists) {
    store.set('bookmarks', bookmarks.filter(b => b.filePath !== filePath));
  } else {
    bookmarks.push({
      filePath,
      fileName,
      relativePath: selectedFolder ? path.relative(selectedFolder, filePath) : filePath,
      createdAt: new Date().toISOString()
    });
    store.set('bookmarks', bookmarks);
  }
  return { success: true, bookmarks: store.get('bookmarks') };
});

ipcMain.handle('get-recent-folders', () => {
  return store.get('recentFolders') || [];
});

ipcMain.handle('open-recent-folder', (event, folderPath) => {
  if (!fs.existsSync(folderPath)) return { success: false, error: 'Folder no longer exists' };
  selectedFolder = folderPath;
  store.set('lastFolder', selectedFolder);
  const files = fileService.scanMarkdownFiles(folderPath);
  return { success: true, folderPath, files };
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
