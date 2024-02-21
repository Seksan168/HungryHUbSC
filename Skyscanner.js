import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { franc } from "franc";
import LanguageDetect from "languagedetect";

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
        allQuotes.forEach(obj => {
            const language = franc(obj.review);
            obj.language = language;
            console.log(obj);
        });
        
        await browser.close();
    } catch (error) {
        console.log("Error:", error);
    }
})();