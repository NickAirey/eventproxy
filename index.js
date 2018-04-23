
let unirest = require('unirest');
let util = require('util');

let auth = process.env.auth;

function getEvents(start, end) {
    return new Promise( (resolve, reject) => {
        unirest.get('https://api.elvanto.com/v1/calendar/events/getAll.json')
            .auth(auth, 'x', true)
            .query({start: start})
            .query({end: end})
            .end((response) => {
                if (response.error) {
                    reject(response);
                } else {
                    resolve(response.body);
                }
            });
    });
}

function logObject(data) {
    console.log(util.inspect(data, {showHidden:false, depth:5}));
    return data;
}

exports.handler = async (event) => {
    return getEvents(event.start, event.end);
};

exports.handler({start: '2018-04-01', end: '2018-05-01'}).then(logObject);

