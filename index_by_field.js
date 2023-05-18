import puppeteer from "puppeteer";

async function run() {
    let browser;
    try {
        // let env = process.env
        // const auth = env.username + ":" + env.password;

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

        const doctors = await page.$$eval('.doctor', doctors => {
            return doctors.map(doctor => {
                const titleElement = doctor.querySelector('.title a');
                const degreeElement = doctor.querySelector('ul li[title="Degree"]');
                const specialtyElement = doctor.querySelector('.speciality');
                const workplaceElement = doctor.querySelector('.workplace');
    
                return {
                    title: titleElement ? titleElement.innerText : null,
                    degree: degreeElement ? degreeElement.innerText : null,
                    specialty: specialtyElement ? specialtyElement.innerText : null,
                    workplace: workplaceElement ? workplaceElement.innerText : null
                };
            });
        });
    
        console.log(doctors);

       

        await browser.close();
    } catch (e) {
        console.error('scrape failed', e);
    } finally {

    }
}

run();