

var libxslt = require('libxslt');
let unirest = require('unirest');
let util = require('util');

var fs = require('fs');




let auth = process.env.auth;

function getEvents(start, end) {
    return new Promise( (resolve, reject) => {
        unirest.get('https://api.elvanto.com/v1/calendar/events/getAll.xml')
            .auth(auth, 'x', true)
            .query({start: start})
            .query({end: end})
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

function logObject(data) {
    console.log(util.inspect(data, {showHidden:false, depth:5}));
    return data;
}

function logError(data) {
    console.error(util.inspect(data, {showHidden:false, depth:5}));
    return data;
}


// make this return a promise
function styleSheet() {
    let stylesheetString = fs.readFileSync('rss.xsl','utf8');
    let stylesheet = libxslt.parse(stylesheetString);

}

function convertObject(documentString) {
    let stylesheetString = fs.readFileSync('rss.xsl','utf8');
    let stylesheet = libxslt.parse(stylesheetString);

    return stylesheet.apply(documentString);
}

return getEvents('2018-04-01', '2018-05-01')
    .then(convertObject)
    .then(logObject)
    .catch((err) => {
        return(logError(err));
    });


