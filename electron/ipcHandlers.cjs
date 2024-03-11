const { shell, ipcMain } = require("electron");
const { APPLICATION_PROTOCOL, HTTP_SERVER_PORT } = require("./app.config.cjs");
const { registerCallback } = require("./handleCallbacks.cjs");

// Simple wrapper to open a URL in the default browser
const visitLinkInBrowser = (url) => shell.openExternal(url);

// Open the browser part of the app to request the signature
// It will await for the callback result (handled by a deeplink)
const handleSignatureRequest = async (request_id, executionTimeout = 0) => {
  // Register the callback so it can be resolved once the deeplink is activated
  const [promise, timeout] = registerCallback(request_id, executionTimeout);

  // Open the browser part
  visitLinkInBrowser(
    `http://localhost:${HTTP_SERVER_PORT}/?request_id=${request_id}&protocol=${APPLICATION_PROTOCOL}&executionTimeout=${executionTimeout}`
  );

  // Wait for the deeplink
  const result = await promise;
  // Clear the timeout as the promise has been resolved
  clearTimeout(timeout);

  return result;
};

// Handle the IPC request
const registerIpcHandlers = (app, context) => {
  ipcMain.handle("signature:request", (event, uuid, timeout) =>
    handleSignatureRequest(uuid, timeout)
  );
};

module.exports = { registerIpcHandlers };
