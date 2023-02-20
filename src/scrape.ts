// const puppeteer = require("puppeteer");
// const $ = require("cheerio");

//const fs = require("fs");
//const path = require("path");



var urlTpl = "https://api.nasdaq.com/api/quote/__STOCK_SYMBOL__/__PARAMS__";
var stockInfoUrlTpl = "https://api.nasdaq.com/api/quote/__STOCK__/info?assetclass=stocks";
(async () => {
   for (let exchange in symbolLists) {
      console.log(`exchange: ,${exchange}=========================\n\n`);

      if (symbolLists.hasOwnProperty(exchange)) {
         const stockSymbols = symbolLists[exchange];
         for (let stockSymbol in stockSymbols) {
            stockSymbol = stockSymbol.toLowerCase();

            /*             if (stockSymbol !== "disa") {
                           continue;
                        } */

            const stockUrlParamTpl = urlTpl.replace(
               "__STOCK_SYMBOL__",
               stockSymbol
            );

            const exchangePath = path.join(__dirname, "scrape-data", exchange);

            const subDir = stockSymbol.charAt(0).toUpperCase();

            const stockPath = path.join(
               exchangePath,
               subDir,
               `${stockSymbol}.json`
            );

            let stockUrl = null;

            // Get Stock Info if stock file does not exist
            if (!fs.existsSync(stockPath)) {
               await processStock({
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
               // Stock file does exist so do not get stock info
               console.log(`\tSkipping: ${stockSymbol}`);
            }

            /*             if (stockSymbol === "disa") {
                           break;
                        } */
         }
      }
   }
})();

async function processStock(passed: any) {
   console.log(`processing: ${passed["exchange"]}: ${passed["stockSymbol"]} -----------------`);

   let stockInfoUrl = stockInfoUrlTpl.replace(
      "__STOCK__",
      passed["stockSymbol"]
   );

   passed["stockInfoUrl"] = stockInfoUrl;
   let stockInfoJson = await getPageContent(passed, "stockInfoUrl");
   passed["stockInfoJson"] = stockInfoJson;
   await saveData(passed, "stockInfoJson");

   const stockUrlParamTpl = passed["stockUrlParamTpl"];
   let newStockUrl = stockUrlParamTpl.replace(
      "__PARAMS__",
      "dividends?assetclass=stocks"
   );
   passed["stockUrl"] = newStockUrl;

   let dividendJson = await getPageContent(passed, "stockUrl");

   let altJson: any;

   if (dividendJson?.data?.dividends?.rows === null) {
      newStockUrl = stockUrlParamTpl.replace(
         "__PARAMS__",
         "dividends?assetclass=etf"
      );
      passed["stockUrl"] = newStockUrl;
      altJson = await getPageContent(passed, "stockUrl");
   }

   if (altJson === undefined || altJson?.data === null) {
      passed["dividendJson"] = dividendJson;
   }
   else {
      passed["dividendJson"] = altJson;
   }

   await saveData(passed, "dividendJson");
}



async function saveData(passed: any, jsonData: string) {
   const passedJson = passed[jsonData];

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

   let filePath = passed["stockPath"];

   if (jsonData === "stockInfoJson") {
      filePath = path.join(
         passed["exchangePath"],
         passed["subDir"],
         `${passed["stockSymbol"]}-info.json`
      );
   }

   fs.writeFileSync(
      path.join(filePath),
      JSON.stringify(passedJson)
   );
}
