
let libxslt = require('libxslt');
let unirest = require('unirest');
let util = require('util');
const END_DAY_OFFSET = 90;

let auth = process.env.auth;

function getEvents(queryObject) {
    return new Promise( (resolve, reject) => {
        unirest.get('https://api.elvanto.com/v1/calendar/events/getAll.xmls')
            .auth(auth, 'x', true)
            .query(queryObject)
            .end((response) => {
                if (response.error) {
                    logError(response.error);
                    reject( {statusCode: response.statusCode, body: response.statusMessage});
                } else {
                    resolve(response.body);
                }
            });
    });
}

function getStyleSheet(stylesheetName) {
    return new Promise( (resolve, reject) => {
        libxslt.parseFile(stylesheetName, (error, stylesheet) => {
            if (error) {
                reject(error);
            }
            resolve(stylesheet);
        });
    });
}

function logError(data) {
    console.error(util.inspect(data, {showHidden:false, depth:5}));
    return data;
}

function logObject(data) {
    console.log(util.inspect(data, {showHidden:false, depth:5}));
    return data;
}

// takes [stylesheetObject, xmlInput]
function applyStylesheet(args) {
    return new Promise( (resolve, reject) => {
        const stylesheet = args[0];
        const xmlInput = args[1];
        stylesheet.apply(xmlInput, null, null, (error, xmlOutput) => {
            if (error) {
                reject(error);
            }
            resolve(xmlOutput);
        });
    });
}

function getQueryObject() {
    let startDate = new Date();
    startDate.setHours(0,0,0,0);
    let startDateStr = startDate.toISOString().slice(0, 10);
    
    let endDate = new Date();
    endDate.setDate(startDate.getDate()+END_DAY_OFFSET);
    let endDateStr = endDate.toISOString().slice(0, 10);

    return logObject({start: startDateStr, end: endDateStr});
}

function invoke() {
    let queryObject = getQueryObject();
    
    // retrieve stylsheet and event data
    Promise.all([getStyleSheet('rss.xsl'), getEvents(queryObject)])
    .then(applyStylesheet)
    .then(xmlOutput => {
        let x = {statusCode: 200, body: xmlOutput};
        return logObject(x);
    })
    .catch((err) => {
        // TODO: read the reject object - convert upstream message
        //let x = {statusCode: statusCode, body: err.message};
        return logError(err);
    });
}


invoke();