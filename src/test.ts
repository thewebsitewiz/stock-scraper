const puppeteer = require('puppeteer');

//a list of sites to screenshot
const papers = {
    nytimes: "https://www.nytimes.com/",
    wapo: "https://www.washingtonpost.com/"
};

//launch puppeteer, do everything in .then() handler
puppeteer.launch({
    devtools: false
}).then(async function (browser) {

    //create a load_page function that returns a promise which resolves when screenshot is taken
    async function load_page(paper) {
        const url = papers[paper];
        return new Promise(async function (resolve, reject) {
            const page = await browser.newPage();
            await page.setViewport({
                width: 1024,
                height: 768
            });

            await Promise.all([
                page.goto(url, {
                    "waitUntil": ["load", "networkidle2"]
                }),
                new Promise(async function (resolve, reject) {

                    //screenshot on first console message
                    page.once("console", async () => {
                        await page.pdf({
                            path: paper + '.pdf',
                            printBackground: true,
                            width: '1024px',
                            height: '768px',
                            margin: {
                                top: "0px",
                                right: "0px",
                                bottom: "0px",
                                left: "0px"
                            }
                        });
                        resolve();
                    });
                })
            ]);

            await page.close();
            resolve();
        })
    }

    //step through the list of papers, calling the above load_page()
    async function stepThru() {
        for (var p in papers) {
            if (papers.hasOwnProperty(p)) {
                //wait to load page and screenshot before loading next page
                await load_page(p);
            }
        }

        await browser.close();
    }

    await stepThru();
});