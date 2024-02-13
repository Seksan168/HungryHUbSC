import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

async function clickNextButtonUntilDisabled(page) {
  const nextButtonSelector = '.r-eqz5dr > .r-obd0qt > .r-13awgt0 > .r-61z16t';

  while (true) {
    // Click the "Next" button
    await page.evaluate((selector) => {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
      } else {
        console.log("Next Button not found");
      }
    }, nextButtonSelector);

    // Wait for a brief moment to let the button click take effect
    await page.waitForTimeout(1000);

    // Check if the button is still present in the DOM
    const isButtonPresent = await page.evaluate((selector) => {
      const button = document.querySelector(selector);
      return !!button;
    }, nextButtonSelector);

    // If the button is not present, break out of the loop
    if (!isButtonPresent) {
      console.log('Next Button is disabled.');
      break;
    }

    // Optional: Add additional waiting or actions if needed
    await page.waitForTimeout(2000);
  }
}

async function scrapePageContent(page) {
  const quotes = await page.evaluate(() => {
    const nameInfoElements = document.querySelector('div.r-f4gmv6 > div.r-obd0qt > div.r-13awgt0 > div.r-eqz5dr');
    const hotel = nameInfoElements.querySelector("h1").innerText;

    const quoteList = document.querySelectorAll(".r-eqz5dr > .css-1dbjc4n > .r-6koalj > .css-1dbjc4n");
    return Array.from(quoteList).map((quote) => {
      const reviews = quote.querySelector(".r-14lw9ot > .r-1habvwh > .r-13qz1uu > .r-1udh08x").innerText;
      const rating = quote.querySelector(".r-14lw9ot > .r-1habvwh > .r-1pz39u2 > .r-1vjbqqu").innerText;
      const date = quote.querySelector(".r-14lw9ot > .r-1habvwh > .r-1pz39u2 > .r-1ud240a").innerText;
      return { hotel, reviews, rating, date };
    });
  });

  return quotes;
}

async function clickNextButtonUntilNoChange(page) {
  const nextButtonSelector = '.r-eqz5dr > .r-obd0qt > .r-13awgt0 > .r-61z16t';

  let previousData = await scrapePageContent(page);

  while (true) {
    // Click the "Next" button
    await page.evaluate((selector) => {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
      } else {
        console.log("Next Button not found");
      }
    }, nextButtonSelector);

    // Wait for a brief moment to let the button click take effect
    await page.waitForTimeout(1000);

    // Check if the button is still present in the DOM
    const isButtonPresent = await page.evaluate((selector) => {
      const button = document.querySelector(selector);
      return !!button;
    }, nextButtonSelector);

    // Get the current scraped data after clicking the "Next" button
    const currentData = await scrapePageContent(page);

    // If the button is not present or the data remains the same, break out of the loop
    if (!isButtonPresent || JSON.stringify(currentData) === JSON.stringify(previousData)) {
      console.log('Next Button is disabled or no change in data.');
      break;
    }

    // Update the previous data for the next iteration
    previousData = currentData;

    // Optional: Add additional waiting or actions if needed
    await page.waitForTimeout(2000);
  }
}

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });

    const page = await browser.newPage();

    await page.goto('https://www.traveloka.com/en-en/hotel/thailand/the-naka-phuket--sha-plus-1000000421770', {
      waitUntil: 'domcontentloaded',
    });

    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});

    let allQuotes = [];
    let isButtonEnabled = true;

    try {
      do {
        const quotes = await scrapePageContent(page);
        allQuotes = allQuotes.concat(quotes);
        // Click the "Next" button and check if it's still visible
        await clickNextButtonUntilNoChange(page);
        await page.waitForTimeout(5000);
        console.log('Data:', allQuotes);
      } while (isButtonEnabled);
      await browser.close();
    } catch (error) {
      console.log(error);
    }
    console.log('Data:', allQuotes);

    await browser.close();
  } catch (error) {
    console.log(error);
  }
})();
