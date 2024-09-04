const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require('fs');
const InstagramBot = require("./instagramBot");
const FacebookBot = require("./facebookBot");
const TwitterBot = require("./twitterBot");
const WhatsAppBot = require("./whatsappBot");
const TelegramBot = require("./telegramBot");

let mainWindow;
let bot;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile("login.html").catch((err) => {
    console.error("Failed to load login.html:", err);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log("Prevented new window:", url);
    return { action: "deny" };
  });
}

function waitForVerificationInput(prompt) {
  return new Promise((resolve) => {
    mainWindow.webContents.send("show-verification-input", prompt);
    ipcMain.once("submit-verification", (_event, input) => {
      resolve(input);
    });
  });
}

function waitForTwoFactorCode() {
  return new Promise((resolve) => {
    ipcMain.once("submit-2fa-code", (_event, code) => {
      resolve(code);
    });
  });
}

function waitForTwoFactorCodei() {
  return new Promise((resolve) => {
    mainWindow.webContents.send("show-2fa-input");
    ipcMain.once("submit-2fa-code", (_event, code) => {
      resolve(code);
    });
  });
}

function performLogin(username, password) {
  // Implement your login logic here
  // Return true if the login is successful, false otherwise
  return username === "admin" && password === "password";
}

function getNewScreenshots() {
  // Implement your screenshot capture logic here
  // Return an array of new screenshot file paths
  return ["files/screenshot1.png", "files/screenshot2.png"];
}

// Function to get the user-specific activity file path
function getUserActivityFilePath(username) {
  return path.join(__dirname, `${username}_activity.json`);
}

// Function to load user's activity data from the file
function loadUserActivityData(username) {
  const filePath = getUserActivityFilePath(username);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
      console.error(`Error loading activity data for user ${username}:`, error);
    }
  }
  return { screenshots: [] }; // Ensure that screenshots array is initialized
}

// Function to save user's activity data to the file
function saveUserActivityData(username, activityData) {
  const filePath = getUserActivityFilePath(username);
  try {
    fs.writeFileSync(filePath, JSON.stringify(activityData, null, 2));
  } catch (error) {
    console.error(`Error saving activity data for user ${username}:`, error);
  }
}

ipcMain.handle('get-qr-code', async () => {
  if (!bot) {
      bot = new WhatsAppBot(sendLog, waitForQRScan);
      await bot.launch();
  }
  return bot.getQRCode();
});

ipcMain.handle('submit-phone-number', async (event, data) => {
  if (bot) {
      // Handle phone number submission logic here
  }
});

ipcMain.handle('wait-for-login', async () => {
  if (bot) {
      try {
          await bot.waitForLogin();
          return { success: true };
      } catch (error) {
          return { success: false, error: error.message };
      }
  }
});

function sendLog(log) {
  mainWindow.webContents.send('update-logs', log);
}

async function waitForQRScan(qrCodeDataUrl) {
  mainWindow.webContents.send('update-logs', 'QR code scanned successfully');
  // Additional logic for handling after QR scan can be added here
}

// Example usage
ipcMain.handle('login', async (_event, { username, password }) => {
  try {
    // Perform login logic
    const isLoginSuccessful = await performLogin(username, password);
    if (isLoginSuccessful) {
      // Load user's activity data from the file
      let activityData = loadUserActivityData(username);

      // Update activity data with new information
      activityData.lastLogin = new Date().toISOString();
      activityData.screenshots = [...activityData.screenshots, ...getNewScreenshots()];

      // Save updated activity data to the file
      saveUserActivityData(username, activityData);

      // Proceed with the application
      return { success: true };
    } else {
      return { success: false, error: 'Invalid username or password' };
    }
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("start-instagram-bot", async (_event, { username, password }) => {
  const sendLog = (message) => {
    mainWindow.webContents.send("update-logs", message);
  };

  try {
    const bot = new InstagramBot(username, password, sendLog, waitForTwoFactorCodei);
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
    const bot = new TwitterBot(username, password, sendLog, waitForVerificationInput);
    await bot.run();
    return { success: true };
  } catch (error) {
    sendLog(`Error: ${error.message}`);
    console.error("Error occurred in Twitter bot:", error);
    return { success: false, error: error.message };
  }
});

function waitForQRScan(qrCodeDataUrl) {
  return new Promise((resolve) => {
    mainWindow.webContents.send("show-qr-code", qrCodeDataUrl);
    ipcMain.once("qr-code-scanned", () => {
      resolve();
    });
  });
}

ipcMain.handle("start-whatsapp-bot", async () => {
  const sendLog = (message) => {
    mainWindow.webContents.send("update-logs", message);
  };

  try {
    const bot = new WhatsAppBot(sendLog, waitForQRScan);
    await bot.run();
    return { success: true };
  } catch (error) {
    sendLog(`Error: ${error.message}`);
    console.error("Error occurred in WhatsApp bot:", error);
    return { success: false, error: error.message };
  }
});


ipcMain.handle('start-telegram-bot', async (event) => {
  const sendLog = (message) => {
      event.sender.send('log-message', message);
  };

  const waitForQRScan = async (qrCodeDataUrl) => {
      event.sender.send('show-qr-code', qrCodeDataUrl);
      return new Promise((resolve) => {
          ipcMain.once('qr-code-scanned', () => {
              resolve();
          });
      });
  };

  const telegramBot = new TelegramBot(sendLog, waitForQRScan);
  await telegramBot.run();
});



app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {
  // Handle app quit event
});

ipcMain.on("quit-app", () => {
  app.quit();
});
