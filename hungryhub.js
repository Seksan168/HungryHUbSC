import puppeteer from "puppeteer";
import fs from "fs";
import LanguageDetect from "languagedetect";
import { log } from "console";
//Function scroll
async function scrollToBottom(page) {
  await page.evaluate(async () => {
    while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
      window.scrollBy(0, window.innerHeight);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust the delay if needed
    }
  });
}
const thaimonthStringToNumber= async (month) => {
  const monthMap = {
    "ม.ค": 1,
    "ก.พ.": 2,
    "มี.ค.": 3,
    "เม.ย.": 4,
    "พ.ค.": 5,
    "มิ.ย.": 6,
    "ก.ค.": 7,
    "ส.ค.": 8,
    "ก.ย.": 9,
    "ต.ค.": 10,
    "พ.ย.": 11,
    "ธ.ค.": 12,
  };

  return monthMap[month];
};


const checkLng = async (quote) => {
  if (quote) {
    const lngDetector = new LanguageDetect();
    const lng = lngDetector.detect(quote, 1);
    return lng[0][0];
  }
  return "";
};
 

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.goto('https://web.hungryhub.com/restaurants/kindee-bistro-phuket?locale=th', { 
      waitUntil: "domcontentloaded" 
    });
    await page.setViewport({ 
      width: 1200, height: 800 
    });
    await page.waitForTimeout(8000);
    

  
    
    // Using scrollToBottom twice, adjust the number of times as needed
    await scrollToBottom(page);
    await page.waitForTimeout(9000);
    await scrollToBottom(page);

    //click load more comment
    try {
      let buttonVisible = true;
      do {
        const buttonSelector = '.text-center > button'; 
        if(buttonVisible){
        await page.click(buttonSelector);
        await scrollToBottom(page);
        await page.waitForTimeout(6000);}
      } while (buttonVisible);
      console.log("Load more content Button not found");
      
    } catch (error) {
      console.log(error);
    }
    
    const quotes = await page.evaluate(async() =>{
      let users=[]
      let locations = []
      let comments = []
      let datefulls =[]
      let dates = []
      let rates = []
      let cnt = 0

      const elements = document.querySelectorAll(".border-b > .py-3 > .justify-around > .mx-4 > .text-xs > span ")
      const eusers = document.querySelectorAll(".border-b > .py-3 > .justify-around > .ml-4 > .mx-auto > .my-1")
      const elocations = document.querySelectorAll(".border-b > .py-3 > .justify-around > .mx-4 > .mb-1")
      const edates = document.querySelectorAll(".border-b > .py-3 > .justify-around > .ml-4 > .mx-auto > .text-xs")
      const erates =document.querySelectorAll(".border-b > .py-3 > .justify-around")
      for(let element of elements){
        comments = comments.concat(element.innerText)
        cnt++
      }
      for(let el of erates){

        const erates = el.querySelectorAll('.mx-4 > div > svg')
        rates = rates.concat(erates.length)
        // rates = erates.length
      }
      for(let euser of eusers){
        users = users.concat(euser.innerText)
      }
      for(let elocation of elocations){
        locations = locations.concat(elocation.innerText)
      }
      for(let edate of edates){
        dates = dates.concat(edate.innerText)
      }
      
      
     
      return {users,locations,dates,comments, cnt,rates}
      
    
    })
    // for(let quote of quotes){
    //     const datesp = quote
    //     quotes.datesp = `${dates[2]}-${await monthStringToNumber(dates[1])} -${
    //       date[2].split(",")[0]}`;
    //     }
    let month = 0;
    month = await thaimonthStringToNumber(quotes.dates[0].split(" ")[1])

    
    
    
    console.log("month",month);
    console.log(quotes);
    console.log(quotes.users[0],
      quotes.locations[0],
      quotes.rates[0],
      quotes.comments[0],
      quotes.dates[0]
      );
    

  
    await browser.close();
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
