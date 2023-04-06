const loopUtils = require("./utils/loop-utils");
const contentUtils = require("./utils/content-utils");

const mySQLUtils = require("./utils/mysql-utils");

import { Company } from "./interfaces/stockSymbols";

const companyInfoUrlTpl =
  "https://api.nasdaq.com/api/quote/__STOCK_SYMBOL__/info?assetclass=stocks";

// https://api.nasdaq.com/api/quote/fsk/info?assetclass=stocks

const companyProfileUrlTpl =
  "https://api.nasdaq.com/api/company/__STOCK_SYMBOL__/company-profile";

// https://api.nasdaq.com/api/company/fsk/company-profile

const dividendDataUrlTpl =
  "https://api.nasdaq.com/api/quote/__STOCK_SYMBOL__/__PARAMS__";

const dividendParams = [
  "dividends?assetclass=stocks",
  "dividends?assetclass=etf",
];

// https://api.nasdaq.com/api/quote/fsk/dividends?assetclass=stocks
// https://api.nasdaq.com/api/quote/fsk/dividends?assetclass=etf

const historicalDataUrlTpl =
  "https://api.nasdaq.com/api/quote/__STOCK_SYMBOL__/historical?assetclass=stocks&fromdate=2013-03-02&limit=__LIMIT__&todate=2023-03-02";

// Field Lists
const companyInfoFields: string[] = [
  "symbol",
  "companyName",
  "stockType",
  "exchange",
  "isNasdaqListed",
  "isNasdaq100",
  "assetClass",
  "keyStats",
];

const companyProfileFields: string[] = [
  "addressString",
  "phone",
  "industry",
  "sector",
  "region",
  "companyUrl",
  "companyDescription",
];

const companyDividendInfoFields = [
  "exDividendDate",
  "dividendPaymentDate",
  "yield",
  "annualizedDividend",
  "payoutRatio",
];

const dividendInfoFields = [
  "exOrEffDate",
  "type",
  "amount",
  "declarationDate",
  "recordDate",
  "paymentDate",
  "currency",
];

(async () => {
  loopUtils.loopThruStocks(getStockInfo);
  // .dbClose();
})();

async function getStockInfo(exchange: string, symbol: string) {
  const symbolTableFields: any = {
    symbol: "",
    companyName: "",
    stockType: "",
    exchange: "",
    exchangeNickname: "",
    isNasdaqListed: undefined,
    isNasdaq100: undefined,
    assetClass: "",
    keyStats: "",
    addressString: undefined,
    phone: "",
    industry: "",
    sector: "",
    region: "",
    companyUrl: "",
    companyDescription: "",
  };

  const keyExecutivesTableFields: any = ["name", "title"];

  const notificationsTableFields: any = ["headline", "message", "eventName"];

  const dividendsTableFields: any = [
    "exOrEffDate",
    "type",
    "amount",
    "declarationDate",
    "recordDate",
    "paymentDate",
    "currency",
  ];

  // get Company Info
  const companyInfoUrl = companyInfoUrlTpl.replace("__STOCK_SYMBOL__", symbol);
  const infoJson = await contentUtils.getPageContent(companyInfoUrl);

  // get Company Profile
  const companyProfileUrl = companyProfileUrlTpl.replace(
    "__STOCK_SYMBOL__",
    symbol
  );
  const profileJson = await contentUtils.getPageContent(companyProfileUrl);

  // get Dividends
  const dividendUrlTpl = dividendDataUrlTpl.replace("__STOCK_SYMBOL__", symbol);

  const firstDividendUrl = dividendUrlTpl.replace(
    "__PARAMS__",
    dividendParams[0]
  );

  const secondDividendUrl = dividendUrlTpl.replace(
    "__PARAMS__",
    dividendParams[1]
  );

  let dividendJson = await contentUtils.getPageContent(firstDividendUrl);

  if (dividendJson?.data === null) {
    dividendJson = await contentUtils.getPageContent(secondDividendUrl);
  }

  // Build Symbol Table Insert
  const stockInfoInsert: { [index: string]: any } = {
    symbol: "",
    companyName: null,
    stockType: null,
    exchange: null,
    isNasdaqListed: null,
    isNasdaq100: null,
    assetClass: null,
    keyStats: null,
    addressString: null,
    phone: null,
    industry: null,
    sector: null,
    region: null,
    companyUrl: null,
    companyDescription: null,
  };

  for (let property of companyInfoFields) {
    if (
      infoJson !== null &&
      infoJson.data !== undefined &&
      infoJson.data !== null &&
      infoJson.data[property] &&
      infoJson.data[property] !== null
    ) {
      stockInfoInsert[property] = infoJson.data[property];
    } else {
      stockInfoInsert[property] = null;
    }
  }

  for (let property of companyProfileFields) {
    if (
      profileJson !== null &&
      profileJson.data !== undefined &&
      profileJson.data !== null &&
      profileJson.data[property] &&
      profileJson.data[property] !== null
    ) {
      if (property === "addressString") {
        stockInfoInsert[property] = profileJson.data["Address"]["value"];
      } else {
        property = property.charAt(0).toUpperCase() + property.slice(1);
        stockInfoInsert[property] = profileJson.data[property]["value"];
      }
    } else {
      stockInfoInsert[property] = null;
    }
  }

  // Insert into Symbols Table
  mySQLUtils.insertRow("symbols", stockInfoInsert);

  // Build Notifications Insert
  if (
    infoJson.notifications !== undefined &&
    infoJson.notifications.length > 0
  ) {
    infoJson.notifications.notifications.forEach(async (notification: any) => {
      const notificationInsert: any = { symbols_symbol: symbol };

      if (notification["headline"]) {
        notificationInsert["headline"] = notification["headline"];
      }

      if (
        notification["eventTypes"] !== undefined &&
        notification["eventTypes"][0]["message"]
      ) {
        notificationInsert["message"] =
          notification["eventTypes"][0]["message"];
      }

      if (notification["eventTypes"]) {
        notificationInsert["eventName"] =
          notification["eventTypes"][0]["eventName"];
      }

      if (notification["eventTypes"][0]["url"]["value"]) {
        notificationInsert.push(notification["eventTypes"][0]["url"]["value"]);
      } else {
        notificationInsert.push(null);
      }

      const notificationCols = [
        "symbols_symbol",
        "headline",
        "message",
        "eventName",
        "url",
      ];
    });
  }
  //
  // OLD FROM HERE DOWN
  //

  // Get Stock Info
  /*
  for (let property of stockInfoFields) {
    if (
      infoJson !== null &&
      infoJson.data !== undefined &&
      infoJson.data !== null &&
      infoJson.data[property].value !== null
    ) {
      const lowerProperty =
        property.charAt(0).toLowerCase() + property.slice(1);
      stockInsert[lowerProperty] = infoJson.data[property].value;
    }
  }

  if (stockInsert !== undefined && stockInsert["address"] !== null) {
    stockInsert["addressString"] = stockInsert["address"];
    stockInsert["address"] = undefined;
  }

  // Get Stock Company Profile
  let companyUrl = stockCompanyUrlTpl.replace("__STOCK_SYMBOL__", stockSymbol);

  const companyJson = await contentUtils.getPageContent(companyUrl);

  for (let property of stockCompanyFields) {
    if (
      companyJson !== null &&
      companyJson.data !== undefined &&
      companyJson.data !== null &&
      companyJson.data[property] !== undefined &&
      companyJson.data[property] !== null
    ) {
      if (property === "symbol") {
        let lowerSymbol = companyJson.data[property].toLowerCase();
        companyJson.data[property] = lowerSymbol;
      }
      stockInsert[property] = companyJson.data[property];
    }
  }

  // Get Stock Data
  const dataUrlTpl = stockDataUrlTpl.replace("__STOCK_SYMBOL__", stockSymbol);

  const firstDataUrl = dataUrlTpl.replace("__PARAMS__", params[0]);

  const secondDataUrl = dataUrlTpl.replace("__PARAMS__", params[1]);
  let url = firstDataUrl;
  let dataJson = await contentUtils.getPageContent(firstDataUrl);

  if (dataJson?.data === null) {
    url = secondDataUrl;
    dataJson = await contentUtils.getPageContent(secondDataUrl);
  }

  for (let property of stockDataFields) {
    if (
      dataJson !== null &&
      dataJson.data !== undefined &&
      dataJson.data !== null &&
      dataJson.data[property] &&
      dataJson.data[property] !== null
    ) {
      stockInsert[property] = dataJson.data[property];
    }
  }

  if (
    dataJson !== null &&
    dataJson.data !== undefined &&
    dataJson.data !== null &&
    dataJson.data["dividends"] &&
    dataJson.data["dividends"] !== null
  ) {
    stockInsert["dividends"] = dataJson.data["dividends"].rows;
  }
  try {
    await mongoUtils.insertSymbolData(stockInsert);
  } catch (err) {
    console.error("ERROR: addSymbolSummary: ", exchange, stockSymbol, err);
  }
  */
}

/*    let stockInsert: any = {
      symbol: "",
      companyName: "",
      stockType: "",
      exchange: "",
      isNasdaqListed: undefined,
      isNasdaq100: undefined,
      isHeld: undefined,
      assetClass: "",
      keyStats: "",
      notifications: undefined,
      address: undefined,
      addressString: undefined,
      phone: "",
      industry: "",
      sector: "",
      region: "",
      companyUrl: "",
      companyDescription: "",
      keyExecutives: undefined,
   }; */
