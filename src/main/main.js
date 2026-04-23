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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function buildExportHtml(html, theme) {
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1D1D1F' : '#FFFFFF';
  const textColor = isDark ? '#F5F5F7' : '#1D1D1F';
  const codeBg = isDark ? '#2D2D2D' : '#f5f5f5';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: ${bgColor}; color: ${textColor}; }
  .markdown-body { line-height: 1.6; }
  h1, h2, h3 { margin: 24px 0 12px; }
  h1 { font-size: 2em; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.25em; }
  p { margin: 16px 0; }
  code { background: ${codeBg}; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
  pre { background: ${codeBg}; padding: 16px; border-radius: 8px; overflow-x: auto; }
  pre code { padding: 0; background: none; }
  a { color: #007AFF; }
  blockquote { border-left: 4px solid #007AFF; padding-left: 16px; margin: 16px 0; color: #666; }
  ul, ol { margin: 16px 0; padding-left: 24px; }
  img { max-width: 100%; }
  @media print { body { margin: 0; background: white; color: black; } code { background: #f0f0f0; } pre { background: #f0f0f0; } }
</style></head><body><div class="markdown-body">${html}</div></body></html>`;
}

function buildStandaloneHtml(html, title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; padding: 20px; }
    h1, h2, h3 { margin: 24px 0 12px; }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    p { margin: 16px 0; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    pre { background: #f0f0f0; padding: 16px; border-radius: 8px; overflow-x: auto; }
    pre code { padding: 0; background: none; }
    a { color: #007AFF; }
    blockquote { border-left: 4px solid #007AFF; padding-left: 16px; margin: 16px 0; color: #666; }
    ul, ol { margin: 16px 0; padding-left: 24px; }
    img { max-width: 100%; }
  </style>
</head>
<body>${html}</body>
</html>`;
}

function isPathInsideFolder(filePath, folderPath) {
  const normalizedFile = path.normalize(filePath);
  const normalizedFolder = path.normalize(folderPath);
  return normalizedFile.startsWith(normalizedFolder);
}

ipcMain.handle('export-pdf', async (event, payload) => {
  const { html, fileName, theme } = payload;
  const savePath = await dialog.showSaveDialog(mainWindow, {
    title: 'Export PDF',
    defaultPath: fileName.replace('.md', '.pdf'),
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  if (savePath.canceled) return { success: false, error: 'Canceled' };

  // Create hidden window for PDF generation
  const exportWindow = new BrowserWindow({
    width: 900, height: 1200, show: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });

  const exportHtml = buildExportHtml(html, theme);
  await exportWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(exportHtml));
  await exportWindow.webContents.waitFor('did-finish-load');

  const pdfBuffer = await exportWindow.webContents.printToPDF({
    printBackground: true, pageSize: 'A4'
  });

  fs.writeFileSync(savePath.filePath, pdfBuffer);
  exportWindow.destroy();
  return { success: true, filePath: savePath.filePath };
});

ipcMain.handle('export-html', async (event, payload) => {
  const { html, fileName } = payload;
  const savePath = await dialog.showSaveDialog(mainWindow, {
    title: 'Export HTML',
    defaultPath: fileName.replace('.md', '.html'),
    filters: [{ name: 'HTML', extensions: ['html'] }]
  });
  if (savePath.canceled) return { success: false };

  const standaloneHtml = buildStandaloneHtml(html, fileName);
  fs.writeFileSync(savePath.filePath, standaloneHtml, 'utf-8');
  return { success: true, filePath: savePath.filePath };
});

ipcMain.handle('export-markdown', async (event, filePath) => {
  if (!selectedFolder || !isPathInsideFolder(filePath, selectedFolder)) {
    return { success: false, error: 'Access denied' };
  }
  const savePath = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Markdown',
    defaultPath: path.basename(filePath),
    filters: [{ name: 'Markdown', extensions: ['md'] }]
  });
  if (savePath.canceled) return { success: false };
  fs.copyFileSync(filePath, savePath.filePath);
  return { success: true };
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
