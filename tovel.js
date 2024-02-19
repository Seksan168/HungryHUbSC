import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

(async function scrapeComments() {
  puppeteer.use(StealthPlugin());

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.skyscanner.co.th/hotels/thailand/ban-kammala-hotels/the-naka-phuket/ht-115499867&locale=en-US');

  // Clicking to expand all reviews
  await page.click('.Reviews__cta__3TprB');

  // Wait for the reviews to load
  try {
    await page.waitForSelector('.ReviewList__item__2TXu7');

    // Extracting comments
    const comments = await page.evaluate(() => {
      const reviewItems = document.querySelectorAll('.ReviewList__item__2TXu7');
      const commentsArray = [];

      reviewItems.forEach(item => {
        const reviewOn = item.querySelector('.Review__title__2fnbW').textContent;
        const reviewDetail = item.querySelector('.Review__body__2eNob').textContent;
        const rating = item.querySelector('.Rating__starRating__2mgTY').textContent;

        commentsArray.push({
          reviewOn,
          reviewDetail,
          rating
        });
      });

      return commentsArray;
    });

    console.log('Comments:', comments);

    await browser.close();
  } catch (error) {
    console.log("Error:", error);
  }
})();
