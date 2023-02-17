// /Users/dluken/Documents/Learning/stock-scraper/NASDAQ/A
require('dotenv/config');

const fs = require("fs");
const path = require("path");

const StockSymbolInfo = require('./interfaces/stockSymbolInfo');

const loopUtils = require("./utils/loop-utils");
const contentUtils = require("./utils/content-utils");
const mongoUtils = require("./utils/mongodb-utils");

const companyProfileUrlTpl = "https://api.nasdaq.com/api/company/__STOCK_SYMBOL__/company-profile";

const stockInsertInfo = [
    "symbol",
    "companyName",
    "stockType",
    "exchange",
    "isNasdaqListed",
    "isNasdaq100",
    "isHeld",
    "assetClass",
    "keyStats",
    "notifications"
];

const stockInsertSummary = [
    "AddressString",
    "Address",
    "Phone",
    "Industry",
    "Sector",
    "Region",
    "CompanyUrl",
    "CompanyDescription",
    "KeyExecutives"
];

(async () => {

    loopUtils.loopThruStocks(getStockDataForInsert);

    mongoUtils.dbClose();
})();

async function test(exchange: string, stockSymbol: string) {
    console.log(exchange, stockSymbol);
}

async function getStockDataForInsert(exchange: string, stockSymbol: string) {
    const exchangePath = path.join(__dirname, "scrape-data", exchange);
    const subDir = stockSymbol.charAt(0).toUpperCase();

    const stockInfoPath = path.join(
        exchangePath,
        subDir,
        `${stockSymbol}-info.json`
    );


    const stockInsert: typeof StockSymbolInfo = {};
    try {

        const stockJson = JSON.parse(fs.readFileSync(stockInfoPath, 'utf8'));

        if (stockJson !== undefined && stockJson["data"] !== null) {
            for (let property of stockInsertInfo) {
                if (stockJson.data[property]) {
                    stockInsert[property] = stockJson.data[property];
                }
            }
        }

        const stockSummaryUrl = companyProfileUrlTpl.replace(
            "__STOCK_SYMBOL__",
            stockSymbol
        );

        const summaryFilePath = path.join(exchangePath, subDir, `${stockSymbol}-summary.json`);
        let summaryJson: any;

        // if (!fs.existsSync(summaryFilePath)) {
        summaryJson = await contentUtils.getPageContent({ summaryUrl: stockSummaryUrl }, "summaryUrl");

        if (summaryJson?.data !== null) {
            fs.writeFileSync(
                summaryFilePath,
                JSON.stringify(summaryJson)
            );

        }
        else {
            summaryJson = fs.readFileSync(summaryFilePath, 'utf8');
        }


        if (summaryJson?.data !== null) {
            for (let property of stockInsertSummary) {
                if (summaryJson.data[property] !== undefined
                    && summaryJson.data[property]?.value !== null) {
                    stockInsert[property] = summaryJson.data[property]?.value;
                }
                else {
                    stockInsert[property] = null;
                }

            }
        }
        stockInsert["exchange"] = exchange;

        try {
            await mongoUtils.addSymbolSummary('StockSymbols', stockInsert)
        } catch (err) {
            console.error("ERROR: addSymbolSummary: ", exchange, stockSymbol, err);
        }

        // *************************
        // process.exit(0)
        // *************************


    }
    catch (err) {
        console.error("outer try block", err);

        // *************************
        process.exit(0)
        // *************************
    }
}