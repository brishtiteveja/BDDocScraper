import puppeteer from "puppeteer";

async function run() {
    let browser;
    try {
        const auth = 'brd-customer-hl_b8f1b212-zone-scraping_browser:q4sikr9ejprm';
        // browser = await puppeteer.connect({
        //     browserWSEndpoint: `wss://${auth}@zproxy.lum-superproxy.io:9222`
        // });
        const browser = await puppeteer.launch();

        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(2 * 60 * 1000);

        await page.goto('https://www.doctorbangladesh.com');

        // const body = await page.$('body');

        // const html = await page.evaluate(() => 
        //     document.documentElement.outerHTML
        // );
        // console.log(html);

        // const selector = '.doctors';

        // await page.waitForSelector(selector);

        // const el = await page.$(selector);

        // const text = await el.evaluate((e) => 
        //     e.innerHTML
        // );
        // console.log(text);

        const doctors = await page.$$('.doctor');
  
        const doctorDetails = [];

        for (let doctor of doctors) {
            // Use the $eval function to execute a function within the page context
            const title = await doctor.$eval('.title', node => node.textContent);
            const degree = await doctor.$eval('ul > li[title="Degree"]', node => node.textContent);
            const specialty = await doctor.$eval('.speciality', node => node.textContent);
            const workplace = await doctor.$eval('.workplace', node => node.textContent);

            doctorDetails.push({ title, degree, specialty, workplace });
        }

        console.log(doctorDetails);

        await browser.close();
    } catch (e) {
        console.error('scrape failed', e);
    } finally {

    }
}

run();