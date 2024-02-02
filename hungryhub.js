import puppeteer from "puppeteer";
//Function scroll
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
    await page.goto('https://web.hungryhub.com/restaurants/kindee-bistro-phuket?locale=th', { 
      waitUntil: "domcontentloaded" 
    });
    await page.setViewport({ 
      width: 1200, height: 800 
    });
    await page.waitForTimeout(8000);
    

  
    
    // Using scrollToBottom twice, adjust the number of times as needed
    await scrollToBottom(page);
    await page.waitForTimeout(9000);
    await scrollToBottom(page);

    //click load more comment
    try {
      let buttonVisible = true;
      do {
        const buttonSelector = '.text-center > button'; 
        if(buttonVisible){
        await page.click(buttonSelector);
        await scrollToBottom(page);
        await page.waitForTimeout(6000);}
      } while (buttonVisible);
      console.log("Load more content Button not found");
      
    } catch (error) {
      console.log(error);
    }
    
    const reviewVal = await page.evaluate(async() =>{

      let users=[]
      let locations = []
      let comments = []
      let dates =[]
      let rates = []
      let cnt = 0
      const elements = document.querySelectorAll(".border-b > .py-3 > .justify-around > .mx-4 > .text-xs > span ")
      const eusers = document.querySelectorAll(".border-b > .py-3 > .justify-around > .ml-4 > .mx-auto > .my-1")
      const elocations = document.querySelectorAll(".border-b > .py-3 > .justify-around > .mx-4 > .mb-1")
      const edates = document.querySelectorAll(".border-b > .py-3 > .justify-around > .ml-4 > .mx-auto > .text-xs")
      const erates =document.querySelectorAll(".border-b > .py-3 > .justify-around > .mx-4 > div")
      for(let element of elements){
        comments = comments.concat(element.innerText)
        cnt++
      }
      for(let euser of eusers){
        users = users.concat(euser.innerText)
      }
      for(let elocation of elocations){
        locations = locations.concat(elocation.innerText)
      }
      for(let edate of edates){
        dates = dates.concat(edate.innerText)
      }
      for(let erate of edates){
        // Count child elements within the parent element
        const childElementCount = await page.evaluate((erates) => {
        const parentElement = document.querySelector(erates);
        // Check if the parent element exists and has child elements
        if (parentElement) {
        return parentElement.childElementCount; // Return the count of child elements
        }
        return 0; // Return 0 if the parent element does not exist
        }, erates);
        console.log(`Number of child elements: ${childElementCount}`);
        }
        return {users,locations,dates,comments, cnt}


    })

    console.log(reviewVal);
    console.log(reviewVal.users[0],
      reviewVal.locations[0],
      reviewVal.comments[0],
      reviewVal.dates[0]
      );
    

  
    await browser.close();
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
