
let libxslt = require('libxslt');
let libxmljs = libxslt.libxmljs;
let unirest = require('unirest');
let util = require('util');
let AWS = require('aws-sdk');


const END_DAY_OFFSET = 30;

function getParameter(paramName) {
    
    return new Promise( (resolve, reject) => {

        let awsRegion = process.env.AWS_REGION;
        if (typeof awsRegion === 'undefined' || awsRegion === null) {
            reject('unable to find region');
        }

        let ssm = new AWS.SSM({region: awsRegion});
        var params = {
            Names: [ paramName ],
            WithDecryption: false
        };
        ssm.getParameters(params, function(err, data) {
            if (err) {
                reject(err.message); 
            } else {
                if (data.InvalidParameters[0] == paramName) {
                    reject('Unable to retrieve parameter: '+paramName);
                } 
                else if (data.Parameters[0].Name == paramName) {
                    resolve(data.Parameters[0]);
                } 
                else {
                    reject('error retrieving parameter: '+paramName);
                }
            }
        });
    });
}


function getEvents(params) {
    return new Promise( (resolve, reject) => {
        
        let queryObject = params[0];
        let authParamObject = params[1];

        let auth = authParamObject.Value;
        if (typeof auth === 'undefined' || auth === null) {
            reject('unable to find authentication key');
        }

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
  invocation entry point
  
  parallel: 
      retrieve stylsheet
      parallel: retrieve api key and query object
      
    apply stylesheet to xml
    return result
*/
exports.handler = function(event, context, callback) {
    Promise.all([
        getStyleSheet('./rssfeed/rss.xsl'),
        Promise.all([getQueryObject(), getParameter('/api-key/elvanto')]).then(getEvents)
    ])
    .then(applyStylesheet)
    .then(xmlOutput => {
        let result = {"statusCode": 200, "headers": {'Content-Type': 'text/xml'}, "body": xmlOutput};
        logObject(result);
        callback(null, result);
    })
    .catch(err => {
        logError(err);
        let result = {"statusCode": 503, "body": "error processing request"};
        logError(result);
        callback(null, result);
    });
};