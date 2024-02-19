import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());
async function scrollToBottom(page) {
    await page.evaluate(async () => {
      while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
        window.scrollBy(0, window.innerHeight);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust the delay if needed
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
        const buttonSelector = '#app-root > div.MainContent_MainContent__section__Y2FjZ.SEOPageLayout_SEOPageLayout__hotelInformation__MDMxY > div > div.DesktopLayout_DesktopLayout__reviewWrap__ZTkwZ > div > div > section'; 
        await page.click(buttonSelector);
        await scrollToBottom(page);

        const quotes = await page.evaluate(() => {
            // // Check if hotel name is available
            const nameElement = document.querySelector('.DesktopLayout_DesktopLayout__nameStars__MGE5Y > h1');
            const hotelName = nameElement ? nameElement.textContent.trim() : null;
            
            // Select all comment elements
            const quoteList = document.querySelectorAll("#hotel-reviews-content > div > div:nth-child(4)");
            // const nicki = document.querySelectorAll("ReviewCardItem_ReviewCardItem__YTU2Y");
            // console.log(nicki);
            // for(const comment of nicki){
            //     console.log("Im here");
            //     try{
            //         nickiDate = comment.querySelector("div.ReviewCardItem_ReviewCardItem__guestInfo__YmE1Y > p").textContent;
            //     }catch(e){
                    
            //     }
            //     console.log(nickiDate);
            // }
            const datetest = document.querySelector("#hotel-reviews-content > div > div:nth-child(4) > div > div:nth-child(1) > div.ReviewCardItem_ReviewCardItem__guestInfo__YmE1Y > p").innerText;
            const datetest2 = document.querySelector("#hotel-reviews-content > div > div:nth-child(4) > div > div:nth-child(2) > div.ReviewCardItem_ReviewCardItem__guestInfo__YmE1Y > p").innerText;
            const test = document.querySelector("#hotel-reviews-content > div > div:nth-child(4) > div").innerText;
            return Array.from(quoteList).map((quote) => {
                // Extract comment details
                const dates = quote.querySelector("div.ReviewCardItem_ReviewCardItem__guestInfo__YmE1Y > p").innerText;
                const review = quote.querySelector("div.ReviewCardItem_ReviewCardItem__rightSection__YzZkZ > div.FlexibleText_FlexibleText__NWQ0Y.ReviewCardItem_ReviewCardItem__reviewContent__OWU1N > span").innerText;
                const rating = quote.querySelector("div.ReviewCardItem_ReviewCardItem__rightSection__YzZkZ > div.ReviewCardItem_ReviewCardItem__dateAndPartner__ZjRjN > div > span").innerText;
                
                return { hotelName, datetest,datetest2,test, dates, review, rating };
            });
            
        });
        
        for (let quote of quotes) {
            console.log(quote);
        }
        
        // await browser.close();
    } catch (error) {
        console.log("Error:", error);
    }
})();