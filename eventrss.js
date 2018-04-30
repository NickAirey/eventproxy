
let libxslt = require('libxslt');
let libxmljs = libxslt.libxmljs;

let unirest = require('unirest');
let util = require('util');
let fs = require('fs');
const END_DAY_OFFSET = 30;

let auth = process.env.auth;

function getEvents(queryObject) {
    return new Promise( (resolve, reject) => {
        unirest.get('https://api.elvanto.com/v1/calendar/events/getAll.xml')
            .auth(auth, 'x', true)
            .query(queryObject)
            .end((response) => {
                if (response.error) {
                    logError(response.error);
                    reject(response.error);
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

// function readEvents(fileName) {
//   return new Promise(function(resolve, reject){
//     fs.readFile(fileName, 'utf-8', (err, data) => {
//         err ? reject(err) : resolve(data);
//     });
//   });
// }

/*
   expects element with text parseable as a date
   this is a nasty hack to add 10 hours to a UTC date
*/
function addTZOffsetAndConvertToISO(dateElement) {
    const OFFSET_HOURS = 10;
    
    let date1 = new Date(dateElement.text());
    date1.setHours(date1.getHours()+OFFSET_HOURS);
    let date1UTCStr = date1.toUTCString();
    let date2Str = date1UTCStr.substring(0, date1UTCStr.length-4)+" +"+OFFSET_HOURS+"00";
    
    dateElement.text(date2Str);
}

// takes [stylesheetObject, xmlInputStr]
// preprocesses xml to convert dates to ISO format and convert from UTC to local offset
function applyStylesheet(args) {
    return new Promise( (resolve, reject) => {
        const stylesheet = args[0];
        const xmlInputStr = args[1];
        
        var xmlDoc = libxmljs.parseXml(xmlInputStr);
        
        xmlDoc.find('//start_date').forEach(element => addTZOffsetAndConvertToISO(element));
        xmlDoc.find('//end_date').forEach(element => addTZOffsetAndConvertToISO(element));
        
        stylesheet.apply(xmlDoc.toString(), null, null, (error, xmlOutput) => {
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

/*
    parallel: retrieve stylsheet and xml event data
    apply stylesheet to xml
    return result
*/
function invoke() {
    Promise.all([getStyleSheet('rss.xsl'), getEvents(getQueryObject())])
//    Promise.all([getStyleSheet('rss.xsl'), readEvents('events.xml')])
    .then(applyStylesheet)
    .then(xmlOutput => {
        return logObject({statusCode: 200, headers: {'Content-Type': 'text/xml'}, body: xmlOutput});
    })
    .catch(err => {
        logError(err);
        return logError({statusCode: 503, body: 'error processing request'});
    });
}

invoke();