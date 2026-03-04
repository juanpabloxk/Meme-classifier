/* global process */
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import Store from 'electron-store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false // Needed to load local file:// paths for images
    },
  });

  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

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

// Settings Management
ipcMain.handle('store:getSettings', () => {
  return store.get('settings', {
    provider: 'ollama', // Options: ollama, lmstudio, openai, gemini, claude
    apiKey: '',
    baseUrl: 'http://127.0.0.1:11434/v1',
    modelName: 'llava:latest'
  });
});

ipcMain.handle('store:saveSettings', (event, settings) => {
  store.set('settings', settings);
  return true;
});

// File System Management
ipcMain.handle('dialog:selectFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (result.canceled) {
    return null;
  } else {
    return result.filePaths[0];
  }
});

ipcMain.handle('fs:getImages', async (event, folderPath) => {
  try {
    const files = await fs.readdir(folderPath);
    const images = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
    }).map(file => ({
      name: file,
      path: path.join(folderPath, file),
      url: `file://${path.join(folderPath, file)}` 
    }));
    return images;
  } catch (error) {
    console.error('Error reading folder:', error);
    return [];
  }
});

ipcMain.handle('fs:renameImage', async (event, oldPath, newPath) => {
  try {
    await fs.rename(oldPath, newPath);
    return { success: true, newPath };
  } catch (error) {
    console.error('Error renaming file:', error);
    return { success: false, error: error.message };
  }
});

// AI Processing
import { classifyImage } from './llmService.js';

ipcMain.handle('llm:classifyImage', async (event, imagePath, settings) => {
  try {
    const suggestedName = await classifyImage(imagePath, settings);
    return { success: true, name: suggestedName };
  } catch (error) {
    console.error('Error in LLM classification:', error);
    return { success: false, error: error.message };
  }
});
