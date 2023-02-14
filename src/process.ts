// /Users/dluken/Documents/Learning/stock-scraper/NASDAQ/A
require('dotenv/config');

const fs = require("fs");
const path = require("path");

const StockSymbolInfo = require('./interfaces/stockSymbolInfo');
const StockSymbol = require('./schemas/stockSymbols');

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
// loopUtils.loopThruStocks(insertStockSymbol);
loopUtils.loopThruStocks(getStockDataForInsert);

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

    try {
        const stockInsert: typeof StockSymbolInfo = {};

        const stockJson = fs.readFileSync(stockInfoPath, 'utf8');
        console.log("stockJson: ", JSON.parse(stockJson));
        if (stockJson !== undefined &&
            stockJson?.["data"] !== null) {
            for (let property of stockInsertInfo) {
                if (stockInsertInfo.hasOwnProperty(property)) {
                    stockInsert[property] = stockJson["data"][property];
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
        console.log("stockInsert: ", stockInsert);
        // console.log("summaryJson: ", summaryJson)

        // *************************
        // process.exit(0)
        // *************************

        /* }
        else {
            summaryJson = fs.readFileSync(summaryFilePath, 'utf8');
        } */

        if (summaryJson?.data !== null) {
            for (let property of stockInsertSummary) {
                console.log(`${property}: ${stockInsert[property]}`);

                if (summaryJson[property] !== undefined
                    && summaryJson[property]?.value !== null) {
                    stockInsert[property] = summaryJson[property]?.value;
                }
                else {
                    stockInsert[property] = null;
                }

            }

            stockInsert["exchange"] = exchange;
            console.log("stock insert:", stockSymbol, stockInsert)
            try {
                let stock: any = new StockSymbol(stockInsert);
                const stockInsertResult: any = await stock.save();
                //console.log("stock insert:", stock, stockInsertResult)

            } catch (err) {
                console.error(exchange, stockSymbol, err);
            }

            // *************************
            process.exit(0)
            // *************************

        }
    }
    catch (err) {
        console.error("outer try block", err);
    }
}
/* 
        async function insertStockSymbol(stockSymbolInfo: typeof StockSymbolInfo) {
            try {
                let stock = new StockSymbol({
                    "symbol": "BAER",
                    "companyName": "Bridger Aerospace Group Holdings, Inc. Common Stock",
                    "stockType": "Common Stock",
                    "exchange": "NASDAQ-GM",
                    "isNasdaqListed": true,
                    "isNasdaq100": false,
                    "isHeld": false,
                    "assetClass": "STOCKS",
                    "keyStats": null,
                    "notifications": [],
                    "CompanyName": "Bridger Aerospace Group Holdings, Inc.",
                    "Address": "90 AVIATION LANE, BELGRADE, Montana, 59714, United States",
                    "Phone": "+1 406 813-0079",
                    "Industry": null,
                    "Sector": null,
                    "Region": "North America",
                    "CompanyDescription": "Bridger Aerospace Group Holdings Inc operates as an aerial firefighting company. It provides aerial wildfire surveillance, relief and suppression, and aerial firefighting services using next-generation technology and environmentally friendly and sustainable firefighting methods. Bridger Aerospace provides aerial firefighting and wildfire management services to federal and state government agencies, including the United States Forest Service, across the nation.",
                    "CompanyUrl": "www.bridgeraerospace.com",
                    "KeyExecutives": []
                });

                stock = await stock.save();

            }
            catch (e) {

            }
        }
         */