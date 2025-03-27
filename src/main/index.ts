import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { SerialPortHandler } from "./lib/serialPortHandler";

const serialPortHandler = new SerialPortHandler();

function createWindow(): void {
  const mainWindow = new BrowserWindow({
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
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: true,
      contextIsolation: true,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  serialPortHandler.onData((data) => {
    mainWindow.webContents.send("serialport:data", data);
  });
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on("ping", () => console.log("pong"));

  // IPC app
  ipcMain.on("exit-app", () => {
    app.exit();
  });

  // IPC serial port
  ipcMain.handle("serialport:list", async () => {
    return await serialPortHandler.listPorts();
  });

  ipcMain.handle("serialport:connect", async (_, path: string) => {
    return await serialPortHandler.connect(path);
  });

  ipcMain.handle("serialport:disconnect", () => {
    serialPortHandler.disconnect();
  });

  ipcMain.handle("serialport:write", (_, data: string) => {
    serialPortHandler.write(data);
  });

  ipcMain.handle("serialport:portInfo", async () => {
    const port = await serialPortHandler.portInfo();

    return port ? { port: port.port, baudRate: port.baudRate } : null;
  });

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
