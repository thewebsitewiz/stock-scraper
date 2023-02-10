const puppeteer = require("puppeteer");
const $ = require("cheerio");

const fs = require("fs");
const path = require("path");

const utils = require("./utils/symbol-utils");

const symbolLists = utils.getExchangeSymbols();

const urlTpl = "https://api.nasdaq.com/api/quote/__STOCK_SYMBOL__/__PARAMS__";

let chances = [
   0, 2, 4, 5, 7, 10, 12, 14, 17, 20, 24, 27, 31, 34, 39, 43, 49, 58, 69, 82,
];
let userAgents = getUserAgentData();

(async () => {
   for (var exchange in symbolLists) {
      console.log(`exchange: ,${exchange}=========================\n\n`);

      if (symbolLists.hasOwnProperty(exchange)) {
         const stockSymbols = symbolLists[exchange];
         for (let stockSymbol in stockSymbols) {
            stockSymbol = stockSymbol.toLowerCase();

            const stockUrlParamTpl = urlTpl.replace(
               "__STOCK_SYMBOL__",
               stockSymbol
            );
            const exchangePath = path.join(__dirname, exchange);
            const subDir = stockSymbol.charAt(0).toUpperCase();
            const stockPath = path.join(
               exchangePath,
               subDir,
               `${stockSymbol}.json`
            );
            let stockUrl = null;
            if (!fs.existsSync(stockPath)) {
               await processPage({
                  stockUrl,
                  stockUrlParamTpl,
                  stockSymbol,
                  exchange,
                  exchangePath,
                  stockPath,
                  subDir,
                  dividendData: null,
               });
            } else {
               console.log(`\tSkipping: ${stockSymbol}`);
            }
         }
      }
   }
})();

async function processPage(passed) {
   console.log(`processing: ${passed["stockSymbol"]} -----------------`);

   const stockUrlParamTpl = passed["stockUrlParamTpl"];
   let newStockUrl = stockUrlParamTpl.replace(
      "__PARAMS__",
      "dividends?assetclass=stocks"
   );
   passed["stockUrl"] = newStockUrl;

   let dividendJson = await getPageContent(passed);

   if (
      dividendJson === null ||
      dividendJson.data === null ||
      dividendJson.data.dividends === null ||
      dividendJson.data.dividends.rows === null
   ) {
      newStockUrl = stockUrlParamTpl.replace(
         "__PARAMS__",
         "dividends?assetclass=etf"
      );
      passed["stockUrl"] = newStockUrl;
      dividendJson = await getPageContent(passed);
   }

   passed["dividendJson"] = dividendJson;

   if (
      dividendJson.data !== undefined &&
      dividendJson.data !== null &&
      dividendJson.data.dividends !== undefined &&
      dividendJson.data.dividends !== null &&
      dividendJson.data.dividends.rows !== undefined &&
      dividendJson.data.dividends.rows !== null
   ) {
      await saveData(passed);
   } else {
      console.log(`\tSKIPPING ${passed["stockSymbol"]}\n\n`);
   }

   /* 

   Throttle for dev use
   const procressSymbol = 'dgre';
   if (passed['stockSymbol'] === procressSymbol) {
    process.exit(0);
   }

   */
}

async function getPageContent(passed) {
   const browser = await puppeteer.launch({
      headless: true,
   });

   const page = await browser.newPage();

   const userAgent = getUserAgent();

   await page.setUserAgent(userAgent.agent);

   await page.goto(passed["stockUrl"], {
      waitUntil: "domcontentloaded",
      timeout: 300000,
   });

   page.setDefaultTimeout(0);

   const rawData = await page.content();
   const jsonRegEx = new RegExp(/<pre.*?>(.*)<\/pre>/);
   const dividendData = jsonRegEx.exec(rawData)[1];
   const dividendJson = JSON.parse(dividendData);

   await browser.close();

   return dividendJson;
}

async function saveData(passed) {
   const dividendJson = passed["dividendJson"];

   // console.log(`\t\t in saveData: \n\n${JSON.stringify(dividendJson)}`);

   if (
      dividendJson !== null &&
      dividendJson.data !== undefined &&
      dividendJson.data !== null &&
      dividendJson.data.dividends !== undefined &&
      dividendJson.data.dividends !== null &&
      dividendJson.data.dividends.rows !== undefined &&
      dividendJson.data.dividends.rows !== null
   ) {
      if (!fs.existsSync(passed["exchangePath"])) {
         fs.mkdirSync(passed["exchangePath"], {
            recursive: true,
         });
      }

      if (!fs.existsSync(path.join(passed["exchangePath"], passed["subDir"]))) {
         fs.mkdirSync(path.join(passed["exchangePath"], passed["subDir"]), {
            recursive: true,
         });
      }

      fs.writeFileSync(
         path.join(passed["stockPath"]),
         JSON.stringify(passed["dividendJson"])
      );
   } else {
      console.log(
         `\tNo Dividend Data: ${passed["stockSymbol"]}\n\n${dividendData}\n\n`
      );
   }
}

function getUserAgent() {
   const chancesLength = chances.length;

   const pick = Math.floor(Math.random() * chancesLength);

   let choice;
   for (let i = 0; i < chancesLength; i++) {
      if (pick <= chances[i]) {
         choice = chances[i];
      }
      if (pick === chances[i]) {
         break;
      }
   }

   return userAgents[choice];
}

function getUserAgentData() {
   return {
      82: {
         agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
         name: "Chrome 72.0 Win10",
      },
      69: {
         agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36",
         name: "Chrome 72.0 Win10",
      },
      58: {
         agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0",
         name: "Firefox Generic Win10",
      },
      49: {
         agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36",
         name: "Chrome 72.0 Win10",
      },
      43: {
         agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15",
         name: "Safari 12.0 macOS",
      },
      39: {
         agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
         name: "Chrome 72.0 macOS",
      },
      34: {
         agent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
         name: "Chrome/72.0.3626.121 Safari/537.36",
         name: "Chrome 72.0 Win7",
      },
      31: {
         agent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0",
         name: "Firefox Generic Win7",
      },
      27: {
         agent: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:65.0) Gecko/20100101 Firefox/65.0",
         name: "Firefox Generic Linux",
      },
      24: {
         agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36",
         name: "Chrome 72.0 macOS",
      },
      20: {
         agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",
         name: "Chrome 71.0 Win10",
      },
      17: {
         agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134",
         name: "Edge 17.0 Win10",
      },
      14: {
         agent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36",
         name: "Chrome 72.0 Win7",
      },
      12: {
         agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36",
         name: "Chrome 72.0 macOS",
      },
      10: {
         agent: "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0",
         name: "Firefox 60.0 Linux",
      },
      7: {
         agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36",
         name: "Chrome Generic Win10",
      },
      6: {
         agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0",
         name: "Firefox Generic MacOSX",
      },
      5: {
         agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763",
         name: "Edge 18.0 Win10",
      },
      4: {
         agent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36",
         name: "Chrome 72.0 Win7",
      },
      2: {
         agent: "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
         name: "IE 11.0 for Desktop Win10",
      },
      0: {
         agent: "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
         name: "IE 11.0 for Desktop Win7",
      },
   };
}

function showHTML(html) {
   /*
  console.log('******************************');
  console.log('******************************');
  console.log(html);
  console.log('******************************');
  console.log('******************************'); */
}

// Normalizing the text
function getText(linkText) {
   linkText = linkText.replace(/\r\n|\r/g, "\n");
   linkText = linkText.replace(/\ +/g, " ");

   // Replace &nbsp; with a space
   var nbspPattern = new RegExp(String.fromCharCode(160), "g");
   return linkText.replace(nbspPattern, " ");
}

// find the link, by going over all links on the page
async function findByLink(page, linkString) {
   const links = await page.$$("a");
   for (var i = 0; i < links.length; i++) {
      let valueHandle = await links[i].getProperty("innerText");

      let id = await links[i].getProperty("id");
      let linkText = await valueHandle.jsonValue();
      const text = getText(linkText);
      if (linkString == text) {
         //console.log(linkString);
         //console.log(text);
         //console.log("Found");
         //console.log(links[i].getAttribute('id'))
         console.log("id: ", id);
         return links[i];
      }
   }
   return null;
}
