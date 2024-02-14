import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { franc } from "franc";
import LanguageDetect from "languagedetect";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

puppeteer.use(StealthPlugin());


const prisma = new PrismaClient();


const checkLng = async (quote) => {
  if (!quote) return "";
  const lng = franc(quote, { only: ['tha'] });
  if (lng === 'tha') {
    return 'Thai';
  } else {
    const lngDetector = new LanguageDetect();
    const lngResult = lngDetector.detect(quote, 1);
    return lngResult.length > 0 ? lngResult[0][0] : "Unknown";
  }
};

async function scrapePageContent(page) {
    return page.evaluate(() => {
        const formatDateString = (rawDate) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const parts = rawDate.split(' ');
            const monthIndex = months.indexOf(parts[1]);
            return `${parts[2]}/${(monthIndex + 1).toString().padStart(2, '0')}/${parts[0]}`;
        };

        const nameInfoElements = document.querySelector('div.r-f4gmv6 > div.r-obd0qt > div.r-13awgt0 > div.r-eqz5dr');
        const storename = nameInfoElements ? nameInfoElements.querySelector("h1").innerText : ''; 

        const quoteList = document.querySelectorAll(".r-eqz5dr > .css-1dbjc4n > .r-6koalj > .css-1dbjc4n");
        return Array.from(quoteList).map(quote => {
            const reviews = quote.querySelector(".r-14lw9ot > .r-1habvwh > .r-13qz1uu > .r-1udh08x").innerText;
            const rawRating = quote.querySelector(".r-14lw9ot > .r-1habvwh > .r-1pz39u2 > .r-1vjbqqu").innerText;
            let rating = parseFloat(rawRating.replace(/[^0-9.]/g, ''));
            rating = Math.min(10.0, Math.max(0.0, parseFloat(rating.toFixed(1))));
            
            if (isNaN(rating)) {
                console.log(`Invalid rating found: ${rawRating}`);
                rating = null;
            }

            const rawDate = quote.querySelector(".r-14lw9ot > .r-1habvwh > .r-1pz39u2 > .r-1ud240a").innerText;
            const formattedDate = formatDateString(rawDate);
            const Reff = "Traveloka"

            return { storename, reviews, rating, date: formattedDate ,Reff};
        });
    });
}


async function processQuotes(quotes) {
  const processedQuotes = [];
  for (const quote of quotes) {
    const language = await checkLng(quote.reviews);
    processedQuotes.push({ ...quote, language });
  }
  return processedQuotes;
}
async function processAndSaveQuotes(quotes) {
    for (const quote of quotes) {
      const language = await checkLng(quote.reviews);
      const reviewDate = new Date(quote.date); 
      
      const existingRecord = await prisma.review.findFirst({
        where: {
          detail: quote.reviews, 
        },
      });
        if (!existingRecord) {
            await prisma.review.create({ 
            data: {
                organization_id: "65c5a9760b5fff3be7a3afd3",
                storename: quote.storename,
                topic: "",
                detail: quote.reviews,
                rating: quote.rating,
                review_on: reviewDate,
                language: language,
                reference: quote.Reff,
            },
            });
        }
    }
  }
  async function isAriaDisabledTrue(page, selector) {
    const isDisabled = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) {
            const ariaDisabledValue = element.getAttribute('aria-disabled');
            return ariaDisabledValue === 'true';
        }
        return false;
    }, selector);

    return isDisabled;
}
(async () => {
  try {
      const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
      const page = await browser.newPage();
      await page.goto('https://www.traveloka.com/en-en/hotel/thailand/the-naka-phuket--sha-plus-1000000421770', { waitUntil: 'networkidle0' });
      const buttonSelector = '.r-eqz5dr > .r-obd0qt > .r-13awgt0 > .r-61z16t'; 
      let allQuotes = []; 

      do {
          await page.waitForSelector(buttonSelector); 
          const isDisabled = await isAriaDisabledTrue(page, buttonSelector);
          if (!isDisabled) {
              const quotes = await scrapePageContent(page);
              const processedQuotes = await processQuotes(quotes); 
              allQuotes = allQuotes.concat(processedQuotes);
              await page.click(buttonSelector);
              await page.waitForTimeout(5000); 
          }
      } while (!await isAriaDisabledTrue(page, buttonSelector));

      console.log('Data scraping complete.');
      await browser.close();
      await processAndSaveQuotes(allQuotes);
      console.log("Data have been save to database");
      const jsonString = JSON.stringify(allQuotes, null, 2);
      fs.writeFile("Traveloka-comments.json", jsonString, err => {
          if (err) console.log("Error writing file:", err);
          else console.log(`Data saved to Traveloka-comments.json`);
      });
  } catch (error) {
      console.error('Error during scraping:', error);
  }
})();
