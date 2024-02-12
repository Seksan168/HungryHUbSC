import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

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
    await page
    .waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 })
    .catch(() => {});


    const quotes = await page.evaluate(() => {
        const nameInfoElements = document.querySelector('div.r-f4gmv6 > div.r-obd0qt > div.r-13awgt0 > div.r-eqz5dr');
        const hotel = nameInfoElements.querySelector("h1").innerText

        const quoteList = document.querySelectorAll(".r-eqz5dr > .css-1dbjc4n > .r-6koalj > .css-1dbjc4n");
        return Array.from(quoteList).map((quote) => {
            // const Review = document.querySelector('.r-1awozwy');
            // const user = Review.querySelector("div").innerText
            const reviews = quote.querySelector(".r-14lw9ot > .r-1habvwh > .r-13qz1uu > .r-1udh08x").innerText
            const rating = quote.querySelector(".r-14lw9ot > .r-1habvwh > .r-1pz39u2 > .r-1vjbqqu").innerText
            const date = quote.querySelector(".r-14lw9ot > .r-1habvwh > .r-1pz39u2 > .r-1ud240a").innerText
            return { hotel,reviews,rating,date};
        });
        
        
    });
    for (let quote of quotes) {
        const hotelName = quote.hotel;
        const review = quote.reviews;
        const rates = quote.rating;
        const reviewon = quote.date;
        console.log(review);
    }

    if (quotes) {
      console.log('Data:', quotes);
    //   console.log('User:',Review);
    } else {
      console.log('No information selected or hotel name not found.');
    }

    await browser.close();
  } catch (error) {
    console.log(error);
  }
})();
