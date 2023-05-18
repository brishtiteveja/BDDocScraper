const puppeteer = require("puppeteer");
const fs = require("fs")

async function run() {
    let browser;
    try {
        browser = await puppeteer.launch();
        const mainPage = await browser.newPage();
        mainPage.setDefaultNavigationTimeout(2 * 60 * 1000);

        await mainPage.goto('https://www.doctorbangladesh.com/doctors-dhaka/');

        const subMenus = await mainPage.$$eval('.menu-item-has-children', menuItems =>
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
        specialistsByDivision = {}
        if (doctorLinks) {
            await Promise.all(Object.entries(doctorLinks).map(async ([division, doctorsByDivisionUrl]) => {
                const page = await browser.newPage();
                await page.goto(doctorsByDivisionUrl);

                const specialists = await page.evaluate(() => {
                    const anchorElements = Array.from(document.querySelectorAll('.entry-content ul.list li a')); 
                    
                    return anchorElements.map(anchor => ({
                        link: anchor.getAttribute('href'),
                        specialist: anchor.innerText,
                    }));
                });

                specialists.division = division;

                console.log(division);

                await Promise.all(specialists.map(async (specialist) => {
                    console.log(specialist.link)
                    console.log("******")
                    await page.goto(specialist.link);

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

                    console.log("Division = " + division + " \nLink = " + doctorsByDivisionUrl + "\nNumber of doctors = " + specialist.doctors.length + "\n");
                }));

                specialistsByDivision[division] = specialists;

                await page.close();
            }));
        }

        await browser.close();
        fs.writeFileSync('specialist_doctors_new.json', JSON.stringify(specialistsByDivision, null, 2));

    } catch (e) {
        console.error('scrape failed', e);
    } finally {

    }
}

run();
