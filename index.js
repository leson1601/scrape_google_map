// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality.
// Any number of plugins can be added through `puppeteer.use()`
const puppeteer = require('puppeteer-extra');

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

async function parsePlaces(page) {
  let places = [];

  const elements = await page.$$('.fontHeadlineSmall span');  
  if (elements && elements.length) {
    for (const el of elements) {
      const name = await el.evaluate(span => span.textContent);
      places.push({ name });
    }
  }
  return places;
}

async function autoScroll(page) {
  console.log("scroll...")

  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 300;
      var timer = setInterval(() => {
        const element = document.querySelectorAll('.ecceSd')[1];
        const scrollHeight= element.height
        console.log(element)
        element.scrollBy(0, distance);
        totalHeight += distance;
        const endElement = document.querySelector('.HlvSq')
        if(endElement){
        // if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

// That's it, the rest is puppeteer usage as normal 😊
puppeteer.launch({ headless: false }).then(async browser => {
  const page = await browser.newPage();
  // await page.setViewport({ width: 1300, height: 900 });

  await page.goto('https://accounts.google.com/signin/v2/identifier');
  await page.type('[type="email"]', "leson2980");
  await page.click('#identifierNext');
  await page.waitForTimeout(3500);

  await page.type('[type="password"', "gdy5TQM7njg9pmb!mvr");
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  await page.goto('https://www.google.com/maps/search/therapeut+22089/@53.5686355,10.0393388,15z');
  await page.waitForTimeout(3500);
  await autoScroll(page)
  const places = await parsePlaces(page)
  console.log(places.length)
  await browser.close();
});