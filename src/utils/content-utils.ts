const puppeteer = require("puppeteer");

const UserAgents = require("./user-agents");

async function getPageContent(url: string) {
    const browser = await puppeteer.launch({
        headless: true,
    });

    const page = await browser.newPage();
    const userAgent = UserAgents.getUserAgent();
    await page.setUserAgent(userAgent.agent);
    await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 300000,
    });
    page.setDefaultTimeout(0);

    const rawData = await page.content();
    const jsonRegEx = new RegExp(/<pre.*?>(.*)<\/pre>/);

    const result = jsonRegEx.exec(rawData);
    let pageContent: string | null = null;
    if (result !== null && result[1] !== null) {
        pageContent = result[1];
    }

    let pageJson = null;
    if (pageContent !== null) {
        pageJson = JSON.parse(pageContent);
    }

    await browser.close();

    return pageJson;
}

module.exports.getPageContent = getPageContent;


