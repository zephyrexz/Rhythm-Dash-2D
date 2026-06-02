import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    fullscreen: true, // Tetap fullscreen biar imersif
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL('https://rhythm-dash-2d.vercel.app'); 

  // 🎯 FITUR TOMBOL KELUAR: Tangkap ketikan keyboard pemain
  win.webContents.on('before-input-event', (event, input) => {
    // Jika pemain menekan tombol 'Escape' (Esc), aplikasi langsung keluar
    if (input.key.toLowerCase() === 'escape' && input.type === 'keyDown') {
      app.quit();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});