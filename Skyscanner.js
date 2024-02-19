import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());
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

        const quotes = await page.evaluate(() => {
            const nameElement = document.querySelector('.DesktopLayout_DesktopLayout__nameStars__MGE5Y > h1');
            const hotelName = nameElement ? nameElement.textContent.trim() : null;
            const test = document.querySelector("#hotel-reviews-content > div > div:nth-child(4) > div").innerText;
            const reviewItems = document.querySelectorAll("#hotel-reviews-content > div");
            const data = Array.from(reviewItems).map((quote) => {
                const dates = quote.querySelector("div:nth-child(4) > div > div:nth-child(1) > div.ReviewCardItem_ReviewCardItem__guestInfo__YmE1Y > p").innerText;
                const review = quote.querySelector("div:nth-child(4) > div > div:nth-child(1) > div.ReviewCardItem_ReviewCardItem__rightSection__YzZkZ > div.FlexibleText_FlexibleText__NWQ0Y.ReviewCardItem_ReviewCardItem__reviewContent__OWU1N > span").innerText;
                const rating = quote.querySelector("div:nth-child(4) > div > div:nth-child(1) > div.ReviewCardItem_ReviewCardItem__rightSection__YzZkZ > div.ReviewCardItem_ReviewCardItem__dateAndPartner__ZjRjN > div > span").innerText;
                return { dates, review ,rating };
            });
            return { hotelName, data ,test };
        });
        
            console.log(quotes);
        
        
        
    } catch (error) {
        console.log("Error:", error);
    }
})();
