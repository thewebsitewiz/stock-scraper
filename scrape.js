const puppeteer = require('puppeteer');
const $ = require('cheerio');

const nasdaq = ('../data-sources/nasdaq');
const nasdaqList = nasdaq.getNASDAQlist;

const nyse = ('../data-sources/nyse');
const nyseList = nyse.getNYSElist;

const amex = ('../data-sources/amex');
const amexList = amex.getAMEXList;

const urlTpl = "https://api.nasdaq.com/api/quote/__STOCK_SYMBOL__/dividends?assetclass=stocks";

const symbolLists = {
  "NASDAQ": nasdaqList,
  "NYSE": nyseList,
  "AMEX": amexList
};

let historicalDividendJson = {};

let chances = [0, 2, 4, 5, 7, 10, 12, 14, 17, 20, 24, 27, 31, 34, 39, 43, 49, 58, 69, 82];
let userAgents = getUserAgentData();

(async () => {
  for (var exchange in symbolLists) {
    console.log('\texchange: ', exchange);
    if (symbolLists.hasOwnProperty(exchange)) {
      if (exchange === 'NASDAQ') { // throttle
        const stockSymbols = symbolLists[exchange];

        console.log('\t\tstockSymbols: ', stockSymbols);
        for (let stockSymbol in stockSymbols) {
          console.log('\t\t\tstockSymbol: ', stockSymbol);
          if (stockSymbol === 'AACG') { // throttle


            /* 
                        console.log(stockSymbol);
            stockSymbol = stockSymbol.toLowerCase();
            const stockUrl = urlTpl.replace('__STOCK_SYMBOL__', stockSymbol);
            await processPage(stockUrl, stock, exchange); */
          }
        }
      }
    }
  }
})();

async function processPage(url, stock, exchange) {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();
  const override = Object.assign(page.viewport(), {
    height: 1600,
    width: 1366
  });
  await page.setViewport(override);

  const userAgent = getUserAgent();

  await page.setUserAgent(userAgent.agent);

  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 300000
  });

  page.setDefaultTimeout(0);
  //await page.waitForSelector('h1.dividend-history__title');

  console.log('page loaded========================================');
  const rawData = await page.content();
  const jsonRegEx = new RegExp(/<pre.*?>(.*)<\/pre>/);
  const dividendData = jsonRegEx.exec(rawData)[1];
  const dividendJson = JSON.parse(dividendData);

  historicalDividendJson[exchange][stock] = dividendJson
  console.log(historicalDividendJson[exchange][stock]);


  await page.waitFor(2000);
  await browser.close();

}

function getUserAgent() {
  const chancesLength = chances.length;

  const pick = Math.floor(Math.random() * chancesLength);

  let choice;
  for (let i = 0; i < chancesLength; i++) {
    if (pick <= chances[i]) {
      choice = chances[i]
    }
    if (pick === chances[i]) {
      break;
    }
  }

  return userAgents[choice];
};

function getUserAgentData() {
  return {
    82: {
      agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
      name: 'Chrome 72.0 Win10'
    },
    69: {
      agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36',
      name: 'Chrome 72.0 Win10'
    },
    58: {
      agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0',
      name: 'Firefox Generic Win10'
    },
    49: {
      agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
      name: 'Chrome 72.0 Win10'
    },
    43: {
      agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15',
      name: 'Safari 12.0 macOS'
    },
    39: {
      agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
      name: 'Chrome 72.0 macOS'
    },
    34: {
      agent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      name: 'Chrome/72.0.3626.121 Safari/537.36',
      name: 'Chrome 72.0 Win7'
    },
    31: {
      agent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0',
      name: 'Firefox Generic Win7'
    },
    27: {
      agent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:65.0) Gecko/20100101 Firefox/65.0',
      name: 'Firefox Generic Linux'
    },
    24: {
      agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36',
      name: 'Chrome 72.0 macOS'
    },
    20: {
      agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
      name: 'Chrome 71.0 Win10'
    },
    17: {
      agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134',
      name: 'Edge 17.0 Win10'
    },
    14: {
      agent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36',
      name: 'Chrome 72.0 Win7'
    },
    12: {
      agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
      name: 'Chrome 72.0 macOS'
    },
    10: {
      agent: 'Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0',
      name: 'Firefox 60.0 Linux'
    },
    7: {
      agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36',
      name: 'Chrome Generic Win10'
    },
    6: {
      agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0',
      name: 'Firefox Generic MacOSX'
    },
    5: {
      agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763',
      name: 'Edge 18.0 Win10'
    },
    4: {
      agent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
      name: 'Chrome 72.0 Win7'
    },
    2: {
      agent: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
      name: 'IE 11.0 for Desktop Win10'
    },
    0: {
      agent: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
      name: 'IE 11.0 for Desktop Win7'
    }

  }
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
  const links = await page.$$('a')
  for (var i = 0; i < links.length; i++) {
    let valueHandle = await links[i].getProperty('innerText');

    let id = await links[i].getProperty('id');
    let linkText = await valueHandle.jsonValue();
    const text = getText(linkText);
    if (linkString == text) {
      //console.log(linkString);
      //console.log(text);
      //console.log("Found");
      //console.log(links[i].getAttribute('id'))
      console.log('id: ', id);
      return links[i];
    }
  }
  return null;
}