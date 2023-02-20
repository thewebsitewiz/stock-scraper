require('dotenv/config');

var fs = require("fs");
import { unlink } from 'node:fs/promises';
import { json } from 'stream/consumers';

var path = require("path");

var loopUtils = require("./utils/loop-utils");
var contentUtils = require("./utils/content-utils");
var mongoUtils = require("./utils/mongodb-utils");

var dataRoot = "/Users/dennisluken/Documents/Projects/code/stock-scraper/src/scrape-data/";

var companyProfileUrlTpl = "https://api.nasdaq.com/api/company/__STOCK_SYMBOL__/company-profile";
var urlTpl = "https://api.nasdaq.com/api/quote/__STOCK_SYMBOL__/__PARAMS__";
var stockInfoUrlTpl = "https://api.nasdaq.com/api/quote/__STOCK__/info?assetclass=stocks";

var paramStrings = [
    "dividends?assetclass=stocks",
    "info?assetclass=stocks"
];


(async () => {

    loopUtils.loopThruStocks(tuneUpData);

    mongoUtils.dbClose();
})();

async function tuneUpData(exchange: string, stockSymbol: string) {
    console.log(`${exchange} - ${stockSymbol}`);
    const subDir = stockSymbol.charAt(0).toUpperCase();
    const stockPathRoot = path.join(__dirname, "scrape-data", exchange, subDir);

    const summaryFilePath = path.join(stockPathRoot, `${stockSymbol}-summary.json`);
    const infoFilePath = path.join(stockPathRoot, `${stockSymbol}-info.json`);
    const divFilePath = path.join(stockPathRoot, `${stockSymbol}.json`);

    // Check on summary file
    if (fs.existsSync(summaryFilePath)) {
        // summary file exists
        var stats = fs.statSync(summaryFilePath);
        var fileSizeInBytes = stats.size;

        // check if file is 10 bytes or less (bad first attempt)
        // remove file
        // get companyProfile data
        // write to file
        // patch Mongo
        if (fileSizeInBytes < 10) {
            // delete file
            await unlink(summaryFilePath);

            // get company profile json
            const companyProfileJson = await getCompanyProfileJson(stockSymbol);

            // write new company profile file
            fs.writeFileSync(
                summaryFilePath,
                JSON.stringify(companyProfileJson)
            );

            // Patch DB
            if (companyProfileJson !== null && companyProfileJson?.data !== null) {
                patchMongo(stockSymbol, companyProfileJson)
            }
        }
    }
    else {
        // summary file does not exist

        // get company profile json
        const companyProfileJson = await getCompanyProfileJson(stockSymbol);

        // Patch DB
        if (companyProfileJson !== null && companyProfileJson?.data !== null) {
            patchMongo(stockSymbol, companyProfileJson)
        }
    }

}

async function patchMongo(stockSymbol: string, companyProfileJson: any) {
    const stockInfo: any = {};
    const jsonKeys = Object.keys(companyProfileJson.data);
    for (let key of jsonKeys) {
        stockInfo[key] = companyProfileJson.data[key]["value"] || null;
    }

    mongoUtils.patchStock(stockSymbol, stockInfo)
}

async function getCompanyProfileJson(stockSymbol: string) {
    // Get Company Profile Info
    const companyProfileUrl = companyProfileUrlTpl.replace("__STOCK_SYMBOL__", stockSymbol);
    const companyProfileJson = await contentUtils.getPageContent({ companyProfile: companyProfileUrl }, "companyProfile");

    console.log(companyProfileJson);
    return companyProfileJson;
}