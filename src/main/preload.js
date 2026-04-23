const { contextBridge, ipcRenderer } = require('electron');

console.log('[OwnMD preload] Script loading...');

if (typeof contextBridge === 'undefined') {
  console.error('[OwnMD preload] contextBridge is undefined');
} else if (typeof contextBridge.exposeInMainWorld === 'undefined') {
  console.error('[OwnMD preload] contextBridge.exposeInMainWorld is undefined');
} else {
  contextBridge.exposeInMainWorld('ownmd', {
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    getTheme: () => ipcRenderer.invoke('get-theme'),
    setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
    searchFiles: (query) => ipcRenderer.invoke('search-files', query),
    getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
    toggleBookmark: (filePath, fileName) => ipcRenderer.invoke('toggle-bookmark', filePath, fileName),
    getRecentFolders: () => ipcRenderer.invoke('get-recent-folders'),
    openRecentFolder: (path) => ipcRenderer.invoke('open-recent-folder', path)
  });
  console.log('[OwnMD preload] window.ownmd API exposed successfully');
}

window.onerror = function(msg, url, line, col, error) {
  console.error('[OwnMD renderer error]', msg, 'at', url, ':', line, ':', col);
};
