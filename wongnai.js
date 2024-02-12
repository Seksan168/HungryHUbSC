import puppeteer from 'puppeteer-extra';
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import fs from "fs"
import LanguageDetect from "languagedetect"
import { PrismaClient } from '@prisma/client';
import {franc}  from "franc"


puppeteer.use(StealthPlugin());
const prisma = new PrismaClient()


const monthStringToNumber = async (month)=>{
    const months = {
        'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4,
        'พ.ค.': 5, 'มิ.ย.': 6, 'ก.ค.': 7, 'ส.ค.': 8,
        'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12
    };

    return months[month];
}

const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const checkLng = async (quote) =>{
    if(quote){
        const lngDetector = new LanguageDetect()
        const lng = lngDetector.detect(quote, 1)
        return lng[0][0]
    }
    return ""
}


const getQuotes = async (storename,url) =>{
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: "domcontentloaded",
    });

    try {
        const quotes = await page.evaluate(() =>{

            let cnt = 0
           
            const container = document.querySelector(".bOyeoA > .jsNbZd")
            if(!container) return console.log("no contrainer");
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            const dateElement = container.querySelector(".BaseGap-sc-1wadqs8 > span")
            const reviewed_on = dateElement && dateElement.innerText ? dateElement.innerText : "no date";
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            const ratingElememts = Array.from(container.querySelectorAll(".jsNbZd > .mb-6-mWeb > .BaseGap-sc-1wadqs8 > .cJjcqk > .jCciJr"))
            const svg = ratingElememts.map(cl => {
                const color = cl.getAttribute('color')
                if(color != "var(--gray-100)"){
                    cnt++
                }
                return cnt
            })
            const rating = svg[svg.length - 1]
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            const topicElement = container.querySelector(".font-highlight > h5");
            const detailElement = container.querySelector(".sc-1gcav05-0");

            const topic = topicElement && topicElement.innerText ? topicElement.innerText : " no topic";
            const detail = detailElement && detailElement.innerText ? detailElement.innerText : "no detail";
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            
            return {reviewed_on,rating, topic, detail}
        })

        
        const temp = quotes.reviewed_on.split(" ")
        if (temp.length < 3) {
            throw new Error("Date undefined");
        }
        quotes.reviewed_on = `${temp[2]}-${await monthStringToNumber(temp[1])}-${temp[0]}`
        

        quotes.storename = storename
        quotes.reference = "Wongnai"
        const lng = franc(quotes.detail,{ only: ['tha']})
        if( lng === 'tha'){
            quotes.language = "Thai"
        }else {
            quotes.language = await checkLng(quotes.detail)
        }
        
        if(quotes.detail != "no detail"){
            const existingRecord = await prisma.reviews.findFirst({
                where: {
                    detail: quotes.detail
                }
            });
    
            if(!existingRecord){
                await prisma.reviews.create({
    
                    data: {
                        storename: quotes.storename,
                        topic: quotes.topic,
                        detail: quotes.detail,
                        rating: quotes.rating,
                        reviewed_on: new Date(quotes.reviewed_on),
                        language: quotes.language,
                        refereance: quotes.reference,
                        db_id: 1,
                        db_name: "SEE FAH"
                    }
                });
            }
            // console.log('to db');
        }else{
            console.log('no detail: ',url);
        }
        await sleep(7000)
        // console.log(quotes.date, quotes.language, quotes.ratings, quotes.topic, quotes.detail);
        await browser.close();
        return quotes
    } catch (error) {
        await sleep(7000)
        await browser.close();
        console.log("Error:", url);
        console.log(error);
        return
    }
}

const getlink = async (url) => {
    let data = []
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: "domcontentloaded",
    });
  
    try {
        let cnt = 0
        while (true) {
            const loadMoreButton = await page.$('button.lzASJ');
            if (loadMoreButton) {
                await Promise.all([
                    page.click('button.lzASJ'),
                    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {}),
                ]);
                cnt++;
                await sleep(1000); // Sensible delay to mimic human behavior
            } else {
                console.log("All content loaded, or button not found. Total clicks:", cnt);
                break;
            }
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }

    try {
        const quotes = await page.evaluate(() => {

            const nameInfo = document.querySelector(".mb-16-mWeb > .drglhI > .jxBSdL > .ixYUFD > h1 > .cgZHFG")
            const storename = nameInfo.querySelector(".rg18-mWeb").innerText;
            const container = document.querySelectorAll(".relative")
            const links = Array.from(container).map((ref) => {
                const anchor = ref.querySelector(".jIDWoT");
                return anchor ? anchor.href : "";
            }).filter(href => href !== '');

            return {storename,links}
            
    });
    
    
    for(let link of quotes.links){
        data = data.concat(await getQuotes(quotes.storename,link))
    }

    
    await browser.close();
    return data
    } catch (error) {
        await browser.close();
        console.log(error, url);
        return
    }
    
};


let urls = [
    "https://www.wongnai.com/restaurants/seefah-central-world",
    "https://www.wongnai.com/restaurants/seefah-megabangna",
    "https://www.wongnai.com/restaurants/seefah-major",
    "https://www.wongnai.com/restaurants/seefah-thongloh",
    "https://www.wongnai.com/restaurants/seefah-terminal21",
    "https://www.wongnai.com/restaurants/seefah-rama",
    "https://www.wongnai.com/restaurants/seefah-thaniya",
    "https://www.wongnai.com/restaurants/1964540AM-see-fah-terminal21-rama3",
    "https://www.wongnai.com/restaurants/seefah-esplanade-ratchada",
    "https://www.wongnai.com/restaurants/seefah-fashion",
    "https://www.wongnai.com/restaurants/seefah-circle-ratchapruk",
    "https://www.wongnai.com/restaurants/seefah-sathorn",
    "https://www.wongnai.com/restaurants/seefah-esplanade-kaerai",
    "https://www.wongnai.com/restaurants/839955DW-see-fah-โรงพยาบาลเมดพาร์ค",
    "https://www.wongnai.com/restaurants/seefah-lotus-rama3"
    ]

let allComments = []

for (let url of urls) {
    const quotes = await getlink(url);
    allComments = allComments.concat(quotes);
}

const jsonString = JSON.stringify(allComments, null, 2);
const path = 'comments.json'

fs.writeFile(path, jsonString, (err) => {
  if(err){
      console.log("error: ", err);
      return
  }
  console.log(`data saved to ${path}`);
})
