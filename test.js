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
            // // // Check if hotel name is available
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

            const number_quotes = quotes.length
            console.log(number_quotes);
            // console.log('review: '+ quotes);
            quotes.forEach(obj => {
                console.log(obj);
            });
            
            
    await browser.close();
    } catch (error) {
        console.log("Error:", error);
    }
})();