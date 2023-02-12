// /Users/dluken/Documents/Learning/stock-scraper/NASDAQ/A
const fs = require("fs");
const path = require("path");

const mongoose = require('mongoose');
const { StockSymbolInfo } = require('./interfaces/stockSymbolInfo');
const { StockSymbol } = require('./schemas/stockSymbols');

const loopUtils = require("./utils/loop-utils");

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

    const stockDividendPath = path.join(
        exchangePath,
        subDir,
        `${stockSymbol}.json`
    );


    try {
        const stockInfoJson = fs.readFileSync(stockInfoPath, 'utf8');


        console.log(stockInfoJson);
    } catch (err) {
        console.error(stockInfoPath, err);
    }

}



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