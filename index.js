// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality.
// Any number of plugins can be added through `puppeteer.use()`
const puppeteer = require('puppeteer-extra');
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
// const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer')
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
// puppeteer.use(AdblockerPlugin({ blockTrackers: true, interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY }));
const XLSX = require("xlsx");
const { splitAddress } = require('./utils');


async function parsePlaces(page) {
  let scrapedData = [];

  // const elements = await page.$$('.fontHeadlineSmall span');  

  const elements = await page.$$('.hfpxzc');
  if (elements && elements.length) {
    for (let el of elements) {
      // const name = await el.evaluate(span => span.textContent);
      await el.click();
      await page.waitForTimeout(2000);
      const infoElements = await page.$$('.dS8AEf');

      if (infoElements[2]) {
        const name = await infoElements[2].$eval('h1.DUwDvf span', el => el.textContent);

        const type = await page.evaluate(() => {
          const element = document.querySelector('button.DkEaL[jsaction="pane.rating.category"]');
          if (element) {
            return element.textContent;
          }
          return '';
        });

        const rate = await page.evaluate(() => {
          const element = document.querySelector('.mmu3tf span span span');
          if (element) {
            return element.textContent;
          }

          return '';
        });

        const address = await page.evaluate(() => {
          const element = document.querySelector('button.CsEnBe[data-item-id="address"] .Io6YTe');
          if (element) {
            return element.textContent;
          }

          return '';
        });

        // const address = await infoElements[2].$$eval('div.Io6YTe', el => el[0].textContent);
        const { street, postalCode, ort } = splitAddress(address);

        const website = await page.evaluate(() => {
          const element = document.querySelector('a.CsEnBe[aria-label^="Website"]');
          if (element) {
            // return element.href;
            return {
              t: "s",
              v: element.href,
              l: { Target: element.href, Tooltip: element.href }
            };
          }

          return '';
        });
        const phone = await page.evaluate(() => {
          const element = document.querySelector('button.CsEnBe[data-item-id^="phone"] .Io6YTe');

          if (element) {
            return element.textContent;
          }
          return '';
        });
        // const phone = await infoElements[2].$eval('.CsEnBe[aria-label^="Phone"] .Io6YTe', el => el.textContent)
        // console.log({ name, type, address, website, phone });
        // const url = {
        //   t: "s",
        //   v: page.url(),
        //   l: { Target: page.url(), Tooltip: page.url() } // Target is the URL, optionally specify Tooltip
        // };
        // const urlCell = {
        //   t: "s",
        //   v: "Google map",
        //   f: `HYPERLINK("${page.url()}", "Google map")`
        // };
        // const url = `=HYPERLINK("${page.url()}", "Click for report")`
        scrapedData.push({ name, type, rate, street, postalCode, ort, website, phone, url: page.url() });
      }


    }
  }
  return scrapedData;
}

async function autoScroll(page) {
  console.log("scroll...");

  await page.evaluate(async () => {
    await new Promise((resolve) => {
      // var totalHeight = 0;
      var distance = 300;
      var timer = setInterval(() => {
        const element = document.querySelectorAll('.ecceSd')[1];
        // const scrollHeight= element.height

        element.scrollBy(0, distance);
        // totalHeight += distance;
        const endElement = document.querySelector('.HlvSq');
        if (endElement) {
          // if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
  await page.waitForTimeout(2000);
}
const login = async (page) => {
  await page.goto('https://accounts.google.com/signin/v2/identifier');
  await page.type('[type="email"]', "leson2980");
  await page.click('#identifierNext');
  await page.waitForTimeout(4000);
  // await page.waitForNavigation();
  await page.waitForSelector('input[type="password"]');

  await page.type('[type="password"', "gdy5TQM7njg9pmb!mvr");
  await page.keyboard.press('Enter');
  await page.waitForNavigation();
};

const exportXLSX = (scrapedData, fileName) => {
  const headings = [["Firmierung/Name", "Typ", "Bewertung", "Straße und Hausnummer", "PLZ", "Stadt", "Webseite", "Telefon", "URL Fundort"]];
  // workbook
  const wb = XLSX.utils.book_new();
  // worksheet
  const ws = XLSX.utils.json_to_sheet(scrapedData, { origin: 'A2', skipHeader: true });
  XLSX.utils.sheet_add_aoa(ws, headings);

  XLSX.utils.book_append_sheet(wb, ws);
  XLSX.writeFile(wb, fileName);
};

// That's it, the rest is puppeteer usage as normal 😊
puppeteer.launch(
  {
    headless: false,
    // args: [`--window-size=${1536},${1024}`],
    defaultViewport: null,
    args: ['--start-maximized']
  }
).then(async browser => {
  const page = await browser.newPage();
  // await page.setViewport({ width: 1300, height: 900 });
  // await page.setViewport({ width: 1536, height: 1024 });
  //  await page.setViewport({ width: 0, height: 0 });
  await login(page);
  await page.goto('https://www.google.com/maps/search/physiotherapie+20357');
  await page.waitForNavigation();
  await autoScroll(page);
  const scrapedData = await parsePlaces(page);

  exportXLSX(scrapedData, "scrapedData.xlsx");

  await browser.close();
});