"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const serialport = require("serialport");
const icon = path.join(__dirname, "../../resources/icon.png");
class SerialPortHandler {
  port = null;
  dataListener = null;
  buffer = "";
  // ذخیره داده‌های دریافتی که ممکن است ناقص باشند
  async listPorts() {
    return serialport.SerialPort.list();
  }
  connect(path2, baudRate = 115200) {
    return new Promise((resolve, reject) => {
      this.port = new serialport.SerialPort({ path: path2, baudRate });
      this.port.on("open", () => {
        console.log(`Connected to ${path2}`);
        resolve(`Connected to ${path2}`);
      });
      this.port.on("error", (err) => {
        console.error(`Error connecting to port: ${err.message}`);
        reject(err);
      });
      this.port.on("close", () => {
        console.log("Port closed");
      });
      this.port.on("data", (data) => {
        this.buffer += data.toString();
        while (this.buffer.includes("ENDOFPKT")) {
          const packetEndIndex = this.buffer.indexOf("ENDOFPKT") + "ENDOFPKT".length;
          const completePacket = this.buffer.substring(0, packetEndIndex);
          this.buffer = this.buffer.substring(packetEndIndex);
          console.log(`Complete Packet Received: ${completePacket}`);
          if (this.dataListener) {
            this.dataListener(completePacket);
          }
        }
      });
    });
  }
  disconnect() {
    if (this.port) {
      this.port.close((err) => {
        if (err) {
          console.error(`Error closing port: ${err.message}`);
        } else {
          console.log("Port closed successfully");
        }
      });
      this.port = null;
    }
  }
  write(data) {
    if (this.port) {
      this.port.write(data, (err) => {
        if (err) {
          console.error(`Error writing to port: ${err.message}`);
        } else {
          console.log(`Data sent: ${data}`);
        }
      });
    } else {
      console.warn("No port is connected");
    }
  }
  async portInfo() {
    return this.port;
  }
  onData(listener) {
    this.dataListener = listener;
  }
  clearDataListener() {
    this.dataListener = null;
  }
}
const serialPortHandler = new SerialPortHandler();
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    title: "noise generator",
    center: true,
    minWidth: 900,
    minHeight: 500,
    frame: false,
    vibrancy: "under-window",
    visualEffectState: "active",
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 10, y: 10 },
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: true,
      contextIsolation: true
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  serialPortHandler.onData((data) => {
    mainWindow.webContents.send("serialport:data", data);
  });
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  electron.ipcMain.on("ping", () => console.log("pong"));
  electron.ipcMain.on("exit-app", () => {
    electron.app.exit();
  });
  electron.ipcMain.handle("serialport:list", async () => {
    return await serialPortHandler.listPorts();
  });
  electron.ipcMain.handle("serialport:connect", async (_, path2) => {
    return await serialPortHandler.connect(path2);
  });
  electron.ipcMain.handle("serialport:disconnect", () => {
    serialPortHandler.disconnect();
  });
  electron.ipcMain.handle("serialport:write", (_, data) => {
    serialPortHandler.write(data);
  });
  electron.ipcMain.handle("serialport:portInfo", async () => {
    const port = await serialPortHandler.portInfo();
    return port ? { port: port.port, baudRate: port.baudRate } : null;
  });
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
