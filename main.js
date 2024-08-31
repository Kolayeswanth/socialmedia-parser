const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const InstagramBot = require("./instagramBot");
const FacebookBot = require("./facebookBot");
const TwitterBot = require("./twitterBot");


let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("index.html").catch((err) => {
    console.error("Failed to load index.html:", err);
  });
}

function waitForTwoFactorCode() {
  return new Promise((resolve) => {
    ipcMain.once("submit-2fa-code", (_event, code) => {
      resolve(code);
    });
  });
}

ipcMain.handle("start-instagram-bot", async (_event, { username, password }) => {
  const sendLog = (message) => {
    mainWindow.webContents.send("update-logs", message);
  };

  try {
    const bot = new InstagramBot(username, password, sendLog, waitForTwoFactorCode);
    await bot.run();
    return { success: true };
  } catch (error) {
    sendLog(`Error: ${error.message}`);
    console.error("Error occurred in Instagram bot:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("start-facebook-bot", async (_event, { username, password }) => {
  const sendLog = (message) => {
    mainWindow.webContents.send("update-logs", message);
  };

  try {
    const bot = new FacebookBot(username, password, sendLog, waitForTwoFactorCode);
    await bot.run();
    return { success: true };
  } catch (error) {
    sendLog(`Error: ${error.message}`);
    console.error("Error occurred in Facebook bot:", error);
    return { success: false, error: error.message };
  }
});
ipcMain.handle("start-twitter-bot", async (_event, { username, password }) => {
  const sendLog = (message) => {
    mainWindow.webContents.send("update-logs", message);
  };

  try {
    const bot = new TwitterBot(username, password, sendLog, waitForTwoFactorCode);
    await bot.run();
    return { success: true };
  } catch (error) {
    sendLog(`Error: ${error.message}`);
    console.error("Error occurred in Twitter bot:", error);
    return { success: false, error: error.message };
  }
});
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});