import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function isAriaDisabledTrue(page, selector) {
    const isDisabled = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) {
            const ariaDisabledValue = element.getAttribute('aria-disabled');
            return ariaDisabledValue === 'true';
        }
        return false;
    }, selector);

    return isDisabled;
}

// Example usage
const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
});
const page = await browser.newPage();

await page.goto('https://www.traveloka.com/en-en/hotel/thailand/the-naka-phuket--sha-plus-1000000421770');
const buttonSelector = '.r-eqz5dr > .r-obd0qt > .r-13awgt0 > .r-61z16t';

let result;
do {

    await page.waitForSelector(buttonSelector); // Wait for the button to be available
    await page.click(buttonSelector);
    await page.waitForTimeout(5000);
    result = await isAriaDisabledTrue(page, buttonSelector);
    console.log('Is aria-disabled="true"?', result);
} while (!result);

console.log('Done');
await browser.close();
