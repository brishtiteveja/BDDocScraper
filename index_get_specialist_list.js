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

        await page.goto('https://www.doctorbangladesh.com/doctors-dhaka/');

        // const body = await page.$('body');

        // const html = await page.evaluate(() => 
        //     document.documentElement.outerHTML
        // );
        // console.log(html);

        // const selector = '.list';

        // await page.waitForSelector(selector);

        // const el = await page.$(selector);

        // const text = await el.evaluate((e) => 
        //     e.innerHTML
        // );
        // console.log(text); 

        const subMenus = await page.$$eval('.menu-item-has-children', menuItems =>
        menuItems.reduce((result, menuItem) => {
            const key = menuItem.querySelector('a').innerText;
            const submenuLinks = {};
            const submenu = menuItem.querySelector('.sub-menu');
            if (submenu) {
                submenu.querySelectorAll('li').forEach(li => {
                    const a = li.querySelector('a');
                    const span = li.querySelector('span');
                    if (a && span) {
                        submenuLinks[span.innerText] = a.href;
                    }
                });
            }
            result[key] = submenuLinks;
            return result;
        }, {}));

        

        const doctorLinks = subMenus["Doctors"];
        if (doctorLinks) {
            for (const division in doctorLinks) {
                specialists.division = division;
                const doctorsByDivisionUrl = doctorLinks[division];
                
                await page.goto(doctorsByDivisionUrl);

                const specialists = await page.evaluate(() => {
                    const anchorElements = Array.from(document.querySelectorAll('.entry-content ul.list li a')); 
            
                    return anchorElements.map(anchor => ({
                        link: anchor.getAttribute('href'),
                        specialist: anchor.innerText,
                    }));
                });

                // console.log(specialists);

                for (let specialist of specialists) {
                    // console.log(specialist.link)
                    // console.log("******")
                    await page.goto(specialist.link);
            
                    // Here you'll want to replace 'your_selectors' with the actual CSS selectors
                    // used in the page to identify the elements containing the required information.
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
            
                    specialist.doctors = doctors;

                    // console.log(specialist)
                    // console.log(specialist.doctors);
                }
    
                console.log(specialists);
            }
        }

        await browser.close();
    } catch (e) {
        console.error('scrape failed', e);
    } finally {

    }
}

run();