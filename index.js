const puppeteer = require('puppeteer');
const moment = require('moment');
const htmltabletojson = require('html-table-to-json');

let request = "";

console.log("Starting...");


(async () => {
    for (let j = 0; j < 5; j++) {

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        console.log("Visiting " + 'https://www.podskalska.cz/vossupl/' + moment().add(j, 'days').format('YYMMDD') + '.htm');
        request = await page.goto('https://www.podskalska.cz/vossupl/' + moment().add(j, 'days').format('YYMMDD') + '.htm');
        request = await request.text();
        console.log("Got what I came for. Leaving.")
        
        await browser.close();
        console.log("Closed browser")

        if (request.includes("404")) {
            console.log("Got fail state - 404. Ending.")
            
        }
        else if (!request.includes("Změny v rozvrzích tříd")) {
            console.log("Got fail state - not table. Ending.")
            
        }
        else{
        
        let jsonTables = htmltabletojson.parse(request);
        //console.log(jsonTables.results);

        let classA = null;
        let hour = null
        let subject = null
        let action = null
        let teacher = null
        for (let i = 0; i < jsonTables.results[0].length; i++) {
            if (jsonTables.results[0][i]["Změny v rozvrzích tříd:"] != "") {
                classA = jsonTables.results[0][i]["Změny v rozvrzích tříd:"];
            }
            else {

            }
            hour = jsonTables.results[0][i]["2"];
            subject = jsonTables.results[0][i]["3"];
            group = jsonTables.results[0][i]["4"];
            action = jsonTables.results[0][i]["6"];
            teacher = jsonTables.results[0][i]["8"];

            console.log(classA + hour + subject + group + action + teacher);
        }

    }}
})();
