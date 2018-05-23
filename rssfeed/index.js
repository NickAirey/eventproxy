
let unirest = require('unirest');
let util = require('util');
let AWS = require('aws-sdk');

let libxslt = require('libxslt');
let xml = require('./xmlProcessing');

const STANDARD_EVENT_DAY_OFFSET = 7;
const MAJOR_EVENT_DAY_OFFSET = 90;


Date.prototype.addDays = function(d) {    
   this.setTime(this.getTime() + d*24*60*60*1000); 
   return this;   
};


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

        logObject(queryObject);

        unirest.get('https://api.elvanto.com/v1/calendar/events/getAll.xml')
            .auth(auth, 'x', true)
            .query(queryObject)
            .query('fields\[0\]=assets')
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

// takes [stylesheetObject, xmlInputDoc]
// returns processed xml doc now in rss format
function applyStylesheet(args) {
    return new Promise( (resolve, reject) => {
        const stylesheet = args[0];
        const xmlDoc = args[1];

        stylesheet.apply(xmlDoc, (error, xmlOutput) => {
            if (error) {
                reject(error);
            } else {
                resolve(xmlOutput);
            }
        });
    });
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
    
    let todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    console.log('todayDate: '+todayDate);
    
    let standardEventEndDate = new Date(todayDate);
    standardEventEndDate.addDays(STANDARD_EVENT_DAY_OFFSET);
    console.log('standardEventEndDate: '+standardEventEndDate);
    
    let majorEventEndDate = new Date(todayDate);
    majorEventEndDate.addDays(MAJOR_EVENT_DAY_OFFSET);
    console.log('majorEventEndDate: '+majorEventEndDate);
    
    xml.setDates(todayDate, standardEventEndDate);
    
    Promise.all([
        getStyleSheet('./rssfeed/rss.xsl'),
        Promise.all([{start: todayDate.toISOString().slice(0, 10), end: majorEventEndDate.toISOString().slice(0, 10)}, getParameter('/api-key/elvanto')])
            .then(getEvents)
            .then(xml.preprocessEvents)
    ])
    .then(applyStylesheet)
    .then(xml.postProcessEvents)
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