const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const path = require("path");

class TwitterBot {
  constructor(username, password, sendLog, waitForTwoFactorCode) {
    this.username = username;
    this.password = password;
    this.sendLog = sendLog;
    this.waitForTwoFactorCode = waitForTwoFactorCode;
  }

  async init() {
    this.browser = await puppeteer.launch({ headless: false });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async login() {
    try {
      this.sendLog("Navigating to login page...");
      await this.page.goto("https://x.com/i/flow/login", { waitUntil: "networkidle2", timeout: 30000 });

      this.sendLog("Current URL: " + this.page.url());
      await this.page.screenshot({ path: 'initial-page.png' });

      // Wait for and enter username or email
      this.sendLog("Waiting for username field...");
      const usernameSelector = 'input[autocomplete="username"], input[name="text"], input[type="text"]';
      await this.page.waitForSelector(usernameSelector, { timeout: 15000 });
      this.sendLog("Entering username...");
      await this.page.type(usernameSelector, this.username, { delay: 100 });

      // Use Tab key navigation to focus on the "Next" button
      this.sendLog("Using Tab key to navigate to 'Next' button...");
      await this.page.keyboard.press('Tab');
      await this.delay(500); // Short delay between tabs

      // Press Enter to click the focused "Next" button
      this.sendLog("Pressing Enter to click 'Next' button...");
      await this.page.keyboard.press('Enter');

      // Wait for password field or 2FA modal
      const passwordField = await this.page.waitForSelector('input[type="password"]', { timeout: 15000 }).catch(() => null);
      
      if (!passwordField) {
        // Check if 2FA modal appeared
        const twoFactorModal = await this.page.waitForSelector('input[autocomplete="off"]', { timeout: 15000 }).catch(() => null);
        if (twoFactorModal) {
          this.sendLog("2FA modal detected. Asking for additional input...");
          const secondFactor = await this.waitForTwoFactorCode();
          this.sendLog("Entering provided " + secondFactor + "...");
          await this.page.type('input[autocomplete="off"]', secondFactor, { delay: 100 });
          await this.page.keyboard.press('Enter');
          
          // Wait for password field again
          this.sendLog("Waiting for password field after entering 2FA...");
          await this.page.waitForSelector('input[type="password"]', { timeout: 15000 });
        } else {
          throw new Error("Password field not found, and 2FA modal did not appear.");
        }
      }

      // Enter password
      this.sendLog("Entering password...");
      await this.page.type('input[type="password"]', this.password, { delay: 100 });

      // Use Tab key navigation to focus on the "Log in" button
      this.sendLog("Using Tab key to navigate to 'Log in' button...");
      for (let i = 0; i < 3; i++) {
        await this.page.keyboard.press('Tab');
        await this.delay(500); // Short delay between tabs
      }

      // Press Enter to click the focused "Log in" button
      this.sendLog("Pressing Enter to click 'Log in' button...");
      await this.page.keyboard.press('Enter');
      await this.page.waitForNavigation({ waitUntil: "networkidle2" });

      // Handle 2FA if required after entering the password
      const twoFactorInput = await this.page.waitForSelector('input[autocomplete="one-time-code"]', { timeout: 15000 }).catch(() => null);
      if (twoFactorInput) {
        this.sendLog("2FA required. Waiting for user to input the code...");
        const code = await this.waitForTwoFactorCode();
        await this.page.type('input[autocomplete="one-time-code"]', code, { delay: 100 });
        this.sendLog("Submitting 2FA code...");
        await Promise.all([
          this.page.keyboard.press('Enter'),
          this.page.waitForNavigation({ waitUntil: "networkidle2" }),
        ]);
      }

      // Check if login was successful
      if (this.page.url().includes("login") || this.page.url().includes("error")) {
        await this.page.screenshot({ path: 'login-failed.png' });
        throw new Error("Failed to log in. Please check your credentials.");
      }

      this.sendLog("Successfully logged in!");

    } catch (error) {
      this.sendLog("Login error: " + error.message);
      await this.page.screenshot({ path: 'login-error.png' });
      throw error;
    }
  }

  async takeScreenshot(section, fileName) {
    const screenshotPath = path.join(__dirname, "screenshots", fileName + ".png");
    await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
    this.sendLog("Taking screenshot of " + section + "...");
    await this.page.screenshot({ path: screenshotPath });
    this.sendLog("Screenshot saved as " + fileName + ".png");
  }

  async run() {
    try {
      await this.init();
      await this.login();

      // Example of taking screenshots after login
      await this.page.goto("https://twitter.com/home", { waitUntil: "networkidle2" });
      await this.takeScreenshot("Home Page", "home");
    } catch (error) {
      throw new Error("Bot run failed: " + error.message);
    } finally {
      this.sendLog("Closing browser...");
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

module.exports = TwitterBot;