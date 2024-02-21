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
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.goto('https://www.skyscanner.co.th/hotels/thailand/ban-kammala-hotels/the-naka-phuket/ht-115499867&locale=en-US');

    await page.waitForTimeout(5000);
    await scrollToBottom(page);

    let isButtonDisabled = false;
    let retries = 3; // Number of times to retry clicking the button

    while (!isButtonDisabled && retries > 0) {
        try {
            const nextButtonselector = 'nav.BpkPagination_bpk-pagination__N2VhM > button:nth-child(3)';
            
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
})();
