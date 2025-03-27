import { contextBridge, ipcRenderer } from "electron";

if (!process.contextIsolated) {
  throw new Error("contextIsolated must be enabled in browserWindow");
}

try {
  contextBridge.exposeInMainWorld("context", {
    serialPort: {
      list: () => ipcRenderer.invoke("serialport:list"),
      connect: (path: string) => ipcRenderer.invoke("serialport:connect", path),
      disconnect: () => ipcRenderer.invoke("serialport:disconnect"),
      write: (data: string) => ipcRenderer.invoke("serialport:write", data),
      portInfo: () => ipcRenderer.invoke("serialport:portInfo"),
      onData: (callback: (data: string) => void) => {
        ipcRenderer.on("serialport:data", (_, data) => callback(data));
      },

      removeOnData: () => {
        ipcRenderer.removeAllListeners("serialport:data");
      },
    },

    app: {
      exit: () => ipcRenderer.send("exit-app"),
    },
  });
} catch (err) {
  console.error("Error in contextBridge:", err);
}
