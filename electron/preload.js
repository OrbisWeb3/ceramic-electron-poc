// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron/renderer");

// Expose electron.requestSignature
contextBridge.exposeInMainWorld("electron", {
  requestSignature: (request_id, timeout) =>
    // Invoke `signature:request` (handled inside ./ipcHandlers.cjs)
    ipcRenderer.invoke("signature:request", request_id, timeout),
});
