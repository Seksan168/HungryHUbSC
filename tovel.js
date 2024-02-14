import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function scrapePageContent(page) {
    const quotes = await page.evaluate(() => {
        // Function to format date string to YYYY/MM/DD
        function formatDateString(rawDate) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const parts = rawDate.split(' ');

            const monthIndex = months.indexOf(parts[1]);
            const formattedDate = `${parts[2]}/${(monthIndex + 1).toString().padStart(2, '0')}/${parts[0]}`;

            return formattedDate;
        }

        const nameInfoElements = document.querySelector('div.r-f4gmv6 > div.r-obd0qt > div.r-13awgt0 > div.r-eqz5dr');
        const hotel = nameInfoElements.querySelector("h1").innerText;

        const quoteList = document.querySelectorAll(".r-eqz5dr > .css-1dbjc4n > .r-6koalj > .css-1dbjc4n");
        return Array.from(quoteList).map((quote) => {
            const reviews = quote.querySelector(".r-14lw9ot > .r-1habvwh > .r-13qz1uu > .r-1udh08x").innerText;
            
            const rawRating = quote.querySelector(".r-14lw9ot > .r-1habvwh > .r-1pz39u2 > .r-1vjbqqu").innerText;
            let rating = parseFloat(rawRating.replace(/[^0-9.]/g, ''));
            rating = Math.min(10.0, Math.max(0.0, parseFloat(rating.toFixed(1))));
            
            if (isNaN(rating)) {
                console.log(`Invalid rating found: ${rawRating}`);
                rating = null;
            }

            // Extract and format the date
            const rawDate = quote.querySelector(".r-14lw9ot > .r-1habvwh > .r-1pz39u2 > .r-1ud240a").innerText;
            const formattedDate = formatDateString(rawDate);

            return { hotel, reviews, rating, date: formattedDate };
        });
    });

    return quotes;
}



async function clickAndScrape(page, maxIterations) {
    let allQuotes = [];
    let iteration = 0;

    while (iteration < maxIterations) {
        const quotes = await scrapePageContent(page);
        allQuotes = allQuotes.concat(quotes);

        const isButtonDisabled = await page.evaluate(selector => {
            const button = document.querySelector(selector);
            return button ? button.disabled : true;
        }, '.r-eqz5dr > .r-obd0qt > .r-13awgt0 > .r-61z16t');

        if (isButtonDisabled) {
            console.log('Button is disabled. Exiting loop.');
            break;
        } else {
            console.log('Button is enabled');
            await page.click('.r-eqz5dr > .r-obd0qt > .r-13awgt0 > .r-61z16t');
            await page.waitForTimeout(5000); // Adjust the timeout as needed
            iteration++;
        }
    }

    return allQuotes;
}

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
        });

        const page = await browser.newPage();

        await page.goto('https://www.traveloka.com/en-en/hotel/thailand/the-naka-phuket--sha-plus-1000000421770', {
            waitUntil: 'domcontentloaded',
        });

        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});

        const maxIterations = 3;
        const result = await clickAndScrape(page, maxIterations);

        console.log('Data:', result);
        await browser.close();
    } catch (error) {
        console.log(error);
    }
})();
