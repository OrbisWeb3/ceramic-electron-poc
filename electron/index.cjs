const { app, BrowserWindow } = require("electron");

const { handleDeeplinkCallback } = require("./handleCallbacks.cjs");
const { registerProtocol } = require("./registerProtocol.cjs");
const { registerIpcHandlers } = require("./ipcHandlers.cjs");
const { runServer } = require("./runServer.cjs");

const { SVELTE_PORT } = require("./app.config.cjs");

const path = require("node:path");

// Context to pass around between files (modules)
const CONTEXT = {
  mainWindow: null,
  handleDeeplinkCallback,
  isDevEnvironment: process.env.DEV_ENV === "true",
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  // Register application protocol (and handle duplicate instances)
  registerProtocol(app, CONTEXT);

  // Run the local server (to serve the browser part of the app)
  runServer(app, CONTEXT);

  app.whenReady().then(() => {
    // Register IPC handlers - used for renderer<>backend communication
    registerIpcHandlers(app, CONTEXT);

    createWindow();
  });
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Preload the exposed IPC API
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Check whether to load the live server (dev) or the final build (prod)
  if (CONTEXT.isDevEnvironment) {
    mainWindow.loadURL(`http://localhost:${SVELTE_PORT}/`);

    mainWindow.webContents.on("did-frame-finish-load", () => {
      mainWindow.webContents.openDevTools();
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, "frontend", "index.html"));
  }
};

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
