
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
                    reject(response.error);
                }
                if (response.status >= 200 && response.status < 300) {
                    resolve(response.body);
                }
                reject(response.body);
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

function readEvents(fileName) {
  return new Promise(function(resolve, reject){
    fs.readFile(fileName, 'utf-8', (err, data) => {
        err ? reject(err) : resolve(data);
    });
  });
}

/*
   this is a nasty hack to add 10 hours to a UTC date str
*/
function addTZOffsetAndConvertToISOStr(dateStr) {
    const OFFSET_HOURS = 10;
    var date1 = new Date(dateStr);
    date1.setHours(date1.getHours()+OFFSET_HOURS);
    let date1UTCStr = date1.toUTCString();
    return date1UTCStr.substring(0, date1UTCStr.length-4)+" +"+OFFSET_HOURS+"00";
}

function addTZOffsetAndConvertToISOElement(dateElement) {
    dateElement.text(addTZOffsetAndConvertToISOStr(dateElement.text()));
}


// takes [stylesheetObject, xmlInputStr]
// preprocesses xml to convert dates to ISO format and convert from UTC to local TZ
function applyStylesheet(args) {
    return new Promise( (resolve, reject) => {
        const stylesheet = args[0];
        const xmlInputStr = args[1];
        
        var xmlDoc = libxmljs.parseXml(xmlInputStr, { noblanks: true });
        
        xmlDoc.get('//rsp').attr({ run_date: addTZOffsetAndConvertToISOStr(new Date(Date.now()).toUTCString()) });
        xmlDoc.find('//start_date').forEach(element => addTZOffsetAndConvertToISOElement(element));
        xmlDoc.find('//end_date').forEach(element => addTZOffsetAndConvertToISOElement(element));
        
        // console.log(xmlDoc.toString());
        
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