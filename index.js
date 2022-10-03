const puppeteer = require('puppeteer');
const moment = require('moment');
const htmltabletojson = require('html-table-to-json');
let request = "";
let mysql = require('mysql');

console.log("Starting...");

let con = mysql.createConnection({
    host: "******",
    user: "supplementation",
    password: "*****",
    database: "supplementation"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    //var sql = "INSERT INTO customers (name, address) VALUES ('Company Inc', 'Highway 37')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });
});

(async () => {
    for (let j = 0; j < 5; j++) {

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        //Visits a supplementation page for dates n + 5
        console.log("Visiting " + 'https://www.podskalska.cz/vossupl/su' + moment().add(j, 'days').format('YYMMDD') + '.htm');
        request = await page.goto('https://www.podskalska.cz/vossupl/su' + moment().add(j, 'days').format('YYMMDD') + '.htm');
        //Gets website data to parse
        request = await request.text();
        console.log("Got what I came for. Leaving.")

        //Closing browser because its not longer needed
        await browser.close();
        console.log("Closed browser")

        //Checks if page includes any supplementation or if it exists
        if (request.includes("404")) {
            console.log("Got fail state - 404. Ending.")

        }
        else if (!request.includes("Změny v rozvrzích tříd") || request.includes("Změny v rozvrzích tříd - nejsou")) {
            console.log("Got fail state - not table. Ending.")

        }
        else {

            //Parse table via html-table-to-json package from <table> element to JSON
            let jsonTables = htmltabletojson.parse(request);
            //console.log(jsonTables.results);

            //Sets variables
            let classA = null;
            let hour = null
            let subject = null
            let action = null
            let teacher = null

            //Checks one more time if page really had tables, if not the program quits and moves to another day
            if (jsonTables.length == 0) { console.log("Nothing here.") }
            else {

                //Convert every table found in page source (should be only one but who knows)
                for (let i = 0; i < jsonTables.results[0].length; i++) {
                    if (jsonTables.results[0][i]["Změny v rozvrzích tříd:"] != "") {
                        classA = jsonTables.results[0][i]["Změny v rozvrzích tříd:"];
                    }
                    else {

                        //Assigns values from json to previously defined variables (not needed, might delete)
                        hour = jsonTables.results[0][i]["2"];
                        subject = jsonTables.results[0][i]["3"];
                        group = jsonTables.results[0][i]["4"];
                        subClass = jsonTables.results[0][i]["5"]
                        action = jsonTables.results[0][i]["6"];
                        teacherB = jsonTables.results[0][i]["7"];
                        teacher = jsonTables.results[0][i]["8"];

                        //Checks for types of supplementation
                        if (action.includes("odpadá")) {
                            let response = {
                                class: classA,
                                hour: hour,
                                subject: subject,
                                group: group,
                                action: action,
                                teacher: teacher
                            }
                            //log will be replaced by method to send data to DB
                            console.log(response);
                        }
                        else if (action.includes("přesun")) {
                            let response = {
                                class: classA,
                                hour: hour,
                                classNumber: subClass,
                                subject: subject,
                                group: group,
                                action: action,
                                teacher: teacherB,
                                type: teacher
                            }
                            //log will be replaced by method to send data to DB
                            console.log(response);
                        }
                    }


                    //Obsolete filter method, we will be storing everything. We could make stats from the data later

                    // console.log(classA + hour + subject + group + action + teacher);
                    // if (classA == "3.AV") {
                    //     console.log(classA + hour + subject + group + action + teacher);
                    // } else { console.log("NOTHING HERE") }
                }

            }
        }
    }
})();
