"use strict";
const electron = require("electron");
if (!process.contextIsolated) {
  throw new Error("contextIsolated must be enabled in browserWindow");
}
try {
  electron.contextBridge.exposeInMainWorld("context", {
    serialPort: {
      list: () => electron.ipcRenderer.invoke("serialport:list"),
      connect: (path) => electron.ipcRenderer.invoke("serialport:connect", path),
      disconnect: () => electron.ipcRenderer.invoke("serialport:disconnect"),
      write: (data) => electron.ipcRenderer.invoke("serialport:write", data),
      portInfo: () => electron.ipcRenderer.invoke("serialport:portInfo"),
      onData: (callback) => {
        electron.ipcRenderer.on("serialport:data", (_, data) => callback(data));
      },
      removeOnData: () => {
        electron.ipcRenderer.removeAllListeners("serialport:data");
      }
    },
    app: {
      exit: () => electron.ipcRenderer.send("exit-app")
    }
  });
} catch (err) {
  console.error("Error in contextBridge:", err);
}
