
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
                logObject(data);
                resolve(data.Parameters);          
            }
        });
    });
}

function getEvents(params) {
    return new Promise( (resolve, reject) => {

        let queryObject = params[0];
        let parameters = params[1];

        let auth = parameters[0].Value;
        if (typeof auth === 'undefined' || auth === null) {
            reject('unable to find authentication key');
        }
        
        unirest.get('https://api.elvanto.com/v1/calendar/events/getAll.json')
            .auth(auth, 'x', true)
            .query(queryObject)
            .end((response) => {
                if (response.error) {
                    reject(response.error);
                } 
                switch (response.body.status) {
                    case 'ok':
                        resolve(response.body.events);
                        break;

                    case 'fail':
                        reject(response.body);
                        break;

                    default:
                        reject('unknown EL response code');
                }
            });
    });
}

function addTZOffsetAndConvertToISOStr(dateStr) {
    const OFFSET_HOURS = 10;
    var date1 = new Date(dateStr);
    date1.setHours(date1.getHours()+OFFSET_HOURS);
    let date1UTCStr = date1.toUTCString();
    return date1UTCStr.substring(0, date1UTCStr.length-4)+" +"+OFFSET_HOURS+"00";
}


function mapEvents(response) {
    return new Promise( (resolve, reject) => {
        try {
            response.event.forEach(event => {
                delete event.url;
                event.start_date = addTZOffsetAndConvertToISOStr(event.start_date);
                event.end_date = addTZOffsetAndConvertToISOStr(event.end_date);
            });
            resolve(response);
        } catch (err) {
            reject( {statusCode: 500, body: 'error mapping events'});
        }
    });
}

function logObject(data) {
    console.log(util.inspect(data, {showHidden:false, depth:5}));
    return data;
}

function logError(data) {
    console.error(util.inspect(data, {showHidden:false, depth:5}));
    return data;
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
*/
exports.handler = function(event, context, callback) {

  //console.log('event');
  //console.log(util.inspect(event));
  //console.log('context');
  //console.log(util.inspect(context));
  //console.log('process env');
  //console.log(util.inspect(process.env));

  Promise.all([getQueryObject(), getParameter('/api-key/elvanto')])
    .then(getEvents)
    .then(mapEvents)
    .then(jsonOutput => {
        callback(null, logObject({statusCode: 200, body: jsonOutput}));
    })
    .catch(err => {
        logError(err);
        callback(null, logError({statusCode: 503, body: 'error processing request'}));
    });
};