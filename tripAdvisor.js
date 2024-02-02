// import puppeteer from "puppeteer";
import puppeteer from "puppeteer";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import LanguageDetect from "languagedetect";
// import { PrismaClient } from "@prisma/client";
import { setTimeout } from "timers/promises";

// puppeteer.use(StealthPlugin());
// const prisma = new PrismaClient();

const covertRating = async (number) => {
  const numPart = number.split("_")[3];
  return parseInt(numPart, 10) / 10;
};

const monthStringToNumber = async (month) => {
  const months = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  return months[month];
};
const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const checkLng = async (quote) => {
  if (quote) {
    const lngDetector = new LanguageDetect();
    const lng = lngDetector.detect(quote, 1);
    return lng[0][0];
  }
  return "";
};

const getQuotes = async (url) => {
  // await sleep(7000);
  let data = [];
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    // args: ["--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  // page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {})
  try {
    const quotes = await page.evaluate(() => {
      const nameInfo = document.querySelector(".react-container > .lBkqB");
      if (!nameInfo) return console.log("no infomation selected");

      const name = nameInfo.querySelector(".acKDw > .HjBfq").innerText;
      const store = nameInfo.querySelector(
        ".vQlTa > .cNFrA > span > a"
      ).innerText;

      const storename = name + " " + store;

      const quoteList = document.querySelectorAll(".ui_columns > .is-9");
      return Array.from(quoteList).map((quote) => {
        const topic = quote.querySelector(".quote > a > .noQuotes").innerText;
        const text = quote.querySelector(".ratingDate").innerText;
        const detail = quote.querySelector(
          ".prw_rup > .entry > .partial_entry"
        ).innerText;
        const rating = quote.querySelector(".ui_bubble_rating").className;

        return { storename, topic, text, detail, rating };
      });
    });

    for (let quote of quotes) {
      const date = quote.text.split(" ");
      quote.rating = await covertRating(quote.rating);
      quote.reviewed_on = `${date[3]}-${await monthStringToNumber(date[1])}-${
        date[2].split(",")[0]
      }`;
      quote.language = await checkLng(quote.detail);
      quote.reference = "TripAdvisor";
      delete quote.text;

      // const existingRecord = await prisma.reviews.findFirst({
      //   where: {
      //     detail: quote.detail,
      //   },
      // });

      // if (!existingRecord) {
      //   await prisma.reviews.create({
      //     data: {
      //       storename: quote.storename,
      //       topic: quote.topic,
      //       detail: quote.detail,
      //       rating: quote.rating,
      //       reviewed_on: new Date(quote.reviewed_on),
      //       language: quote.language,
      //       refereance: quote.reference,
      //       db_id: 1,
      //       db_name: "SEE FAH",
      //     },
      //   });
      // }
    }

    data = data.concat(quotes);
    const hasNextPage = await page.evaluate(() => {
      const nextPageButton = document.querySelector(".ui_pagination .nav.next");
      return nextPageButton ? nextPageButton.href : null;
    });

    if (hasNextPage) {
      data = data.concat(await getQuotes(hasNextPage));
      console.log(`Next Page Button Text: ${hasNextPage}`);
    } else {
      console.log("No Next Page Button");
    }

    await sleep(7000);
    await browser.close();
    return data;
  } catch (error) {
    await sleep(7000);
    await browser.close();
    console.log(error, url);
    return;
  }
};

const main = async () => {
  try {
    let urls = [
      "https://www.tripadvisor.com/Restaurant_Review-g293916-d19858038-Reviews-See_Fah-Bangkok.html",
      "https://www.tripadvisor.com/Restaurant_Review-g293916-d6019663-Reviews-Seefah-Bangkok.html",
      "https://www.tripadvisor.com/Restaurant_Review-g304554-d17334800-Reviews-Seefah-Mumbai_Maharashtra.html",
      "https://www.tripadvisor.com/Restaurant_Review-g644049-d13737678-Reviews-Seefah-Bang_Phli_Samut_Prakan_Province.html",
      "https://www.tripadvisor.com/Restaurant_Review-g293916-d13737609-Reviews-Seefah-Bangkok.html",
      "https://www.tripadvisor.com/Restaurant_Review-g293916-d3712622-Reviews-Seefah-Bangkok.html",
      "https://www.tripadvisor.com/Restaurant_Review-g294217-d1322059-Reviews-Seefah_Restaurant-Hong_Kong.html",
      "https://www.tripadvisor.com/Restaurant_Review-g293916-d3713749-Reviews-Seefah-Bangkok.html",
      "https://www.tripadvisor.com/Restaurant_Review-g293916-d9841777-Reviews-Seefah-Bangkok.html",
      "https://www.tripadvisor.com/Restaurant_Review-g293916-d8546847-Reviews-Seefah-Bangkok.html",
      "https://www.tripadvisor.com/Restaurant_Review-g293916-d3714873-Reviews-Seefah_Restaurant-Bangkok.html",
      "https://www.tripadvisor.com/Restaurant_Review-g293916-d3715437-Reviews-Seefah_Restaurant-Bangkok.html",
      "https://www.tripadvisor.com/Restaurant_Review-g293916-d3715113-Reviews-Seefah_Restaurant-Bangkok.html",
    ];
    let allComments = [];

    // for (let url of urls) {
    //   const quotes = await getQuotes(url);
    //   allComments = allComments.concat(quotes); // append is fine
    // }

    await Promise.all(
      urls.map(async (url) => {
        const quotes = await getQuotes(url);
        allComments = allComments.concat(quotes); // append is fine
      })
    );

    console.log("eiei");

    ////////////////////////// compress to json ///////////////////////////////
    const jsonString = JSON.stringify(allComments, null, 2);
    const path = "Tripadvisor-comments.json";

    fs.writeFile(path, jsonString, (err) => {
      if (err) {
        console.log("error: ", err);
        return;
      }
      console.log(`data saved to ${path}`);
    });
  } catch (error) {
    console.log(error);
  }
};

main();
