
let unirest = require('unirest');
let util = require('util');

let auth = process.env.auth;

function getEvents(start, end) {
    let paramsError = null;
    if (!start) {
        paramsError = '"start" parameter not found'
    }
    if (!end) {
        paramsError += (paramsError) ? ', ' : '';
        paramsError += '"end" parameter not found'
    }
    if (paramsError) {
        return Promise.reject({statusCode: 500, body: paramsError});
    }

    return new Promise( (resolve, reject) => {
        unirest.get('https://api.elvanto.com/v1/calendar/events/getAll.json')
            .auth(auth, 'x', true)
            .query({start: start})
            .query({end: end})
            .end((response) => {
                if (response.error) {
                    logError(response.error);
                    reject( {statusCode: response.statusCode, body: response.statusMessage});
                } else {
                    switch (response.body.status) {
                        case 'ok':
                            resolve({statusCode: response.statusCode, body: response.body});
                            break;

                        case 'fail':
                            //logError(response);
                            reject({statusCode: response.body.error.code, body: response.body.error.message});
                            break;

                        default:
                            reject({statusCode: 500, body: 'unknown EL response code'})
                    }
                }
            });
    });
}

function mapEvents(response) {
    return new Promise( (resolve, reject) => {
        try {
            response.body.events.event.map(function (event) {
                delete event.url;
                return event;
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

exports.handler = async (event) => {
    return getEvents(event.start, event.end)
        .then(mapEvents)
        .then(logObject)
        .catch((err) => {
            return(logError(err))
        });
};

exports.handler({start: '2018-04-01', end: '2018-05-01'});