const path = require("node:path");
const { APPLICATION_PROTOCOL } = require("./app.config.cjs");

const registerProtocol = (app, context) => {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(APPLICATION_PROTOCOL, process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    }
  } else {
    app.setAsDefaultProtocolClient(APPLICATION_PROTOCOL);
  }

  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
  } else {
    const { mainWindow, handleDeeplinkCallback } = context;

    // If a second instance pops up, just focus the current window
    // This is triggered when a deeplinks is launched (Windows, Linux)
    app.on("second-instance", (event, commandLine, workingDirectory) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }

      const url = commandLine.pop();
      if (!handleDeeplinkCallback) {
        console.error("You need to have a callback handler in your context.");
      } else {
        handleDeeplinkCallback(url);
      }
    });

    // MacOS' way of dealing with deeplinks
    app.on("open-url", (event, url) => {
      if (!handleDeeplinkCallback) {
        console.error("You need to have a callback handler in your context.");
      } else {
        handleDeeplinkCallback(url);
      }
    });
  }
};

module.exports = { registerProtocol };
