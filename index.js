
var unirest = require('unirest');
var util = require('util');

var auth = process.env.auth;

function getEvents() {
    return new Promise( (resolve, reject) => {
        unirest.get('https://api.elvanto.com/v1/calendar/events/getAll.json')
            .auth(auth, 'x', true)
            .query({start: '2018-04-01'})
            .query({end: '2018-05-01'})
            .end((response) => {
                if (response.error) {
                    reject(response)
                } else {
                    resolve(response.body)
                }
            })
    });
}

function logObject(data) {
    console.log(util.inspect(data, {showHidden:false, depth:5}));
    return data;
}


getEvents().then(logObject);
