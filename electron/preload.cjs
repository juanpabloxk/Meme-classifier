const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  getImages: (folderPath) => ipcRenderer.invoke('fs:getImages', folderPath),
  renameImage: (oldPath, newPath) => ipcRenderer.invoke('fs:renameImage', oldPath, newPath),
  getSettings: () => ipcRenderer.invoke('store:getSettings'),
  saveSettings: (settings) => ipcRenderer.invoke('store:saveSettings', settings),
  classifyImage: (imagePath, settings) => ipcRenderer.invoke('llm:classifyImage', imagePath, settings)
});
