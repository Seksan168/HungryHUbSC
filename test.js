import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

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
        
                    boxElement.forEach(element => {
                        const reviewEl = element.querySelector("div.ReviewCardItem_ReviewCardItem__rightSection__YzZkZ > div.ReviewCardItem_ReviewCardItem__reviewContent__OWU1N > span");
                        const reviewText = reviewEl ? reviewEl.innerText : "Review not found";
                    
                        const ratingEl = element.querySelector("span.BpkText_bpk-text__ZjI3M.BpkText_bpk-text--label-1__MWI4N.BpkRating_bpk-rating__value__YzhiN");  
                        const ratingText = ratingEl ? ratingEl.innerText : "Rating not found";
                        
                        const dateEl = element.querySelector("div.ReviewCardItem_ReviewCardItem__guestInfo__YmE1Y > p.BpkText_bpk-text__ZjI3M.BpkText_bpk-text--caption__NzU1O.ReviewCardItem_ReviewCardItem__info__YTg5Z");
                        const dateText = dateEl ? dateEl.innerText : "Date not found";
                        
                        boxCompress.push({
                            hotel: hotelName,
                            review: reviewText,
                            language: "XX",
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
            console.log(obj);
        });
        while (!isButtonDisabled && retries > 0) {
            try {
                const nextButtonselector = 'nav.BpkPagination_bpk-pagination__N2VhM > button:nth-child(3)';
                const quotes = await page.evaluate(() => {
                    const nameElement = document.querySelector('.DesktopLayout_DesktopLayout__nameStars__MGE5Y > h1');
                    const hotelName = nameElement ? nameElement.textContent.trim() : null;
                    
                    const boxElement = document.querySelectorAll("div.ReviewCardItem_ReviewCardItem__YTU2Y ");
                    
                    const boxCompress = [];
        
                    boxElement.forEach(element => {
                        const reviewEl = element.querySelector("div.ReviewCardItem_ReviewCardItem__rightSection__YzZkZ > div.ReviewCardItem_ReviewCardItem__reviewContent__OWU1N > span");
                        const reviewText = reviewEl ? reviewEl.innerText : "Review not found";
                    
                        const ratingEl = element.querySelector("span.BpkText_bpk-text__ZjI3M.BpkText_bpk-text--label-1__MWI4N.BpkRating_bpk-rating__value__YzhiN");  
                        const ratingText = ratingEl ? ratingEl.innerText : "Rating not found";
                        
                        const dateEl = element.querySelector("div.ReviewCardItem_ReviewCardItem__guestInfo__YmE1Y > p.BpkText_bpk-text__ZjI3M.BpkText_bpk-text--caption__NzU1O.ReviewCardItem_ReviewCardItem__info__YTg5Z");
                        const dateText = dateEl ? dateEl.innerText : "Date not found";
                        
                        boxCompress.push({
                            hotel: hotelName,
                            review: reviewText,
                            language: "XX",
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
            console.log(obj);
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

        await browser.close();
    } catch (error) {
        console.log("Error:", error);
    }
})();