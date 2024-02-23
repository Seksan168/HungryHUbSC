import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { franc } from "franc";
import { PrismaClient } from "@prisma/client";
import fs from 'fs';


const prisma = new PrismaClient()

puppeteer.use(StealthPlugin());

async function scrollToBottom(page) {
    await page.evaluate(async () => {
        while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
            window.scrollBy(0, window.innerHeight);
            await new Promise(resolve => setTimeout(resolve, 1000)); 
        }
    });
}

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
        });
        const page = await browser.newPage();
        await page.goto('https://www.skyscanner.co.th/hotels/thailand/ban-kammala-hotels/the-naka-phuket/ht-115499867&locale=en-US', {
            waitUntil: 'domcontentloaded',
        });
        await page.waitForTimeout(5000);
        
        const buttonReviewSelector = '#app-root > div.MainContent_MainContent__section__Y2FjZ.SEOPageLayout_SEOPageLayout__hotelInformation__MDMxY > div > div.DesktopLayout_DesktopLayout__reviewWrap__ZTkwZ > div > div > section';
        await page.click(buttonReviewSelector);
        await scrollToBottom(page);
        let isButtonDisabled = false;
        let retries = 3; // Number of times to retry clicking the button
        
        let allQuotes = [];
           
        
                const quotes = await page.evaluate(() => {
                    const nameElement = document.querySelector('.DesktopLayout_DesktopLayout__nameStars__MGE5Y > h1');
                    const hotelName = nameElement ? nameElement.textContent.trim() : null;
                    
                    const boxElement = document.querySelectorAll("div.ReviewCardItem_ReviewCardItem__YTU2Y ");
                    
                    const boxCompress = [];
        
                    boxElement.forEach(async element => {
                        const reviewEl = element.querySelector("div.ReviewCardItem_ReviewCardItem__rightSection__YzZkZ > div.ReviewCardItem_ReviewCardItem__reviewContent__OWU1N > span");
                        const reviewText = reviewEl ? reviewEl.innerText.trim() : "Review not found";
                        
                        const ratingEl = element.querySelector("span.BpkText_bpk-text__ZjI3M.BpkText_bpk-text--label-1__MWI4N.BpkRating_bpk-rating__value__YzhiN");
                        const ratingText = ratingEl ? ratingEl.innerText.split('/')[0].trim() : "Rating not found";
                        
                        const dateEl = element.querySelector("div.ReviewCardItem_ReviewCardItem__guestInfo__YmE1Y > p.BpkText_bpk-text__ZjI3M.BpkText_bpk-text--caption__NzU1O.ReviewCardItem_ReviewCardItem__info__YTg5Z");
                        const dateText = dateEl ? formatDate(dateEl.innerText) : "Date not found";
                        console.log('Check Lang');
                        // const language = franc(reviewText, { only: ['tha'] });
                        console.log('Check Lang f');
                    
                    
                        function formatDate(dateString) {
                            const datePart = dateString.split(':')[1].trim();
                            
                            // Check if the date string matches the expected format
                            const dateRegex = /^(\d{1,2}) (\S+) (\d{4})$/;
                            if (!dateRegex.test(datePart)) {
                                // If the date format doesn't match, return a default value
                                return "Invalid date format";
                            }
                            
                            // Parse the date and return it in YYYY/MM/DD format
                            const [, day, month, year] = datePart.match(dateRegex);
                            const monthNumber = {
                                'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04', 'พ.ค.': '05', 'มิ.ย.': '06',
                                'ก.ค.': '07', 'ส.ค.': '08', 'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12'
                            }[month];
                            return `${year}/${monthNumber}/${day}`;
                        }
                        
                        boxCompress.push({
                            hotel: hotelName,
                            review: reviewText,
                            // language: language,
                            rating: ratingText.replaceAll("\n",""),
                            date: dateText,
                            reference: "Skyscanner",
                        });
                    });
                    
                    
                    return boxCompress;
                    
                });
                
                allQuotes = allQuotes.concat(quotes);
        while (!isButtonDisabled && retries > 0) {
            try {
                const nextButtonselector = 'nav.BpkPagination_bpk-pagination__N2VhM > button:nth-child(3)';
                let allQuotes = [];
           
        
                const quotes = await page.evaluate(() => {
                    const nameElement = document.querySelector('.DesktopLayout_DesktopLayout__nameStars__MGE5Y > h1');
                    const hotelName = nameElement ? nameElement.textContent.trim() : null;
                    
                    const boxElement = document.querySelectorAll("div.ReviewCardItem_ReviewCardItem__YTU2Y ");
                    
                    const boxCompress = [];
        
                    boxElement.forEach(async element => {
                        const reviewEl = element.querySelector("div.ReviewCardItem_ReviewCardItem__rightSection__YzZkZ > div.ReviewCardItem_ReviewCardItem__reviewContent__OWU1N > span");
                        const reviewText = reviewEl ? reviewEl.innerText.trim() : "Review not found";
                        
                        const ratingEl = element.querySelector("span.BpkText_bpk-text__ZjI3M.BpkText_bpk-text--label-1__MWI4N.BpkRating_bpk-rating__value__YzhiN");
                        const ratingText = ratingEl ? ratingEl.innerText.split('/')[0].trim() : "Rating not found";
                        
                        const dateEl = element.querySelector("div.ReviewCardItem_ReviewCardItem__guestInfo__YmE1Y > p.BpkText_bpk-text__ZjI3M.BpkText_bpk-text--caption__NzU1O.ReviewCardItem_ReviewCardItem__info__YTg5Z");
                        const dateText = dateEl ? formatDate(dateEl.innerText) : "Date not found";
                        console.log('Check Lang');
                        // const language = franc(reviewText, { only: ['tha'] });
                        console.log('Check Lang f');
                    
                    
                        function formatDate(dateString) {
                            const datePart = dateString.split(':')[1].trim();
                            
                            // Check if the date string matches the expected format
                            const dateRegex = /^(\d{1,2}) (\S+) (\d{4})$/;
                            if (!dateRegex.test(datePart)) {
                                // If the date format doesn't match, return a default value
                                return "Invalid date format";
                            }
                            
                            // Parse the date and return it in YYYY/MM/DD format
                            const [, day, month, year] = datePart.match(dateRegex);
                            const monthNumber = {
                                'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04', 'พ.ค.': '05', 'มิ.ย.': '06',
                                'ก.ค.': '07', 'ส.ค.': '08', 'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12'
                            }[month];
                            return `${year}/${monthNumber}/${day}`;
                        }
                        
                        boxCompress.push({
                            hotel: hotelName,
                            review: reviewText.replaceAll("\n",""),
                            rating: ratingText,
                            date: dateText,
                            reference: "Skyscanner",
                        });
                    });
                    
                    
                    return boxCompress;
                    
                });
                
                allQuotes = allQuotes.concat(quotes);
                
                
           
        
        console.log('Data scraping complete.');
        console.log('Number of quotes:', allQuotes.length);
        allQuotes.forEach(async obj => {
            const language = franc(obj.review);
            obj.language = language;
            try {
                await prisma.$transaction(async (tx) => {
                    const where = {
                        organization_id: "65c5a9760b5fff3be7a3afd3",
                        storename: obj.hotel,
                        rating: parseInt(obj.rating), // Convert rating to integer
                    };
        
                    // Adjust date format if necessary
                    const dateParts = obj.date.split('/');
                    const formattedDate = dateParts.map(part => {
                        return part.length === 1 ? '0' + part : part;
                    }).join('-');
        
                    // Validate date format
                    const isValidDate = !isNaN(Date.parse(formattedDate));
        
                    if (isValidDate) {
                        where.review_on = new Date(formattedDate).toISOString();
                    } else {
                        console.error(`Invalid date format for quote: ${obj}`);
                        return;
                    }
        
                    // Find if the review already exists in the database
                    const exist = await tx.review.findFirst({
                        where: where,
                    });
        
                    if (!exist) {
                        // If the review doesn't exist, create a new one
                        await tx.review.create({
                            data: {
                                organization_id: "65c5a9760b5fff3be7a3afd3",
                                storename: obj.hotel,
                                topic: "",
                                detail: obj.review,
                                rating: parseInt(obj.rating), // Convert rating to integer
                                review_on: where.review_on,
                                language: obj.language,
                                reference: "Sk-testDoc",
                            },
                        });
                    }
                });
                console.log("All quotes uploaded successfully.");
            } catch (error) {
                console.error("Error uploading quotes to the database:", error);
            }
        });
        
                
                // Wait for the button to be available and click it. Increase the timeout if necessary.
                await page.waitForSelector(nextButtonselector, { timeout: 60000 }); // 60 seconds
                await page.click(nextButtonselector);
    
                // Wait for some time to allow for the state change to occur
                await page.waitForTimeout(5000); // Adjust the time as needed
    
                // Check if the button is disabled
                isButtonDisabled = await page.$eval(nextButtonselector, button => button.disabled);
                console.log('Is button disabled?', isButtonDisabled);
            } catch (error) {
                console.error('An error occurred:', error.message);
                retries--; // Decrement the retry count
                if (retries <= 0) {
                    console.log('Maximum retries reached. Exiting...');
                    break; // Exit the loop if we've run out of retries
                }
                console.log(`Retrying... (${retries} retries left)`);
                await page.waitForTimeout(10000); // Wait for 10 seconds before retrying
            }
        }
    
        await browser.close();
        //file write section
        const jsonString = JSON.stringify(allQuotes, null, 2);
        const path = "SkyTestdocument-comments.json";
        fs.writeFile(path, jsonString, (err) => {
            if (err) {
              console.log("error: ", err);
              return;
            }
            console.log(`data saved to ${path}`);
        });
          
          // Database upload section



        
    } catch (error) {
        console.log("Error:", error);
    }
})();
