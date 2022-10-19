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
const keywords = ["physiotherapie", "physio", "physiopraxis", "physiotherapiepraxis", "physiotherapeut"];

const postalCodes = ["20095", "20097", "20099", "20144", "20146", "20148", "20149", "20249", "20251", "20253", "20255", "20257",
  "20259", "20354", "20355", "20357", "20359", "20457", "20459", "20535", "20537", "20359", "20539", "21029", "21031", "21033",
  "21035", "21037", "21039", "21073", "21075", "21077", "21079", "21107", "21109", "21129", "21147", "21149", "22041", "22043",
  "22045", "22047", "22049", "22081", "22083", "22085", "22087", "22089", "22111", "22113", "22115", "22117", "22119", "22143",
  "22145", "22147", "22149", "22159", "22175", "22177", "22179", "22297", "22299", "22301", "22303", "22305", "22307", "22309",
  "22335", "22337", "22339", "22359", "22391", "22393", "22395", "22397", "22399", "22415", "22417", "22419", "22453", "22455",
  "22457", "22459", "22523", "22525", "22527", "22529", "22547", "22549", "22559", "22587", "22589", "22605", "22607", "22609",
  "22761", "22763", "22765", "22767", "22769", "27499",
];

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
        // const name = await infoElements[2].$eval('h1.DUwDvf span', el => el.textContent);
        const name = await page.evaluate(() => {
          const element = document.querySelector('.dS8AEf h1.DUwDvf span');
          if (element) {
            return element.textContent;
          }
          return '';
        });
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
    const startTime = new Date();

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
        // if web stuck or scroll take more than 10 seconds then break
        const diff = new Date() - startTime;
        if (diff > 10000) {
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
  console.log("Exported " + fileName);
};
const scrapePlaces = async (page, searchQuery) => {
  const baseURL = "https://www.google.com/maps/search/";
  searchQuery.replaceAll(" ", "+");
  await page.goto(`${baseURL}${searchQuery}`);
  await page.waitForNavigation();
  await autoScroll(page);
  const scrapedData = await parsePlaces(page);
  return scrapedData;
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
  for (const keyword of keywords) {
    for (const postalCode of postalCodes) {
      const scrapedData = await scrapePlaces(page, `${keyword} ${postalCode}`);
      exportXLSX(scrapedData, `${keyword}_${postalCode}.xlsx`);
    }
  }

  await browser.close();
});