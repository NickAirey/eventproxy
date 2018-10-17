/**
 Author: Nick Airey
 **/

let httpClient = require('axios');
let util = require('util');

exports.getEvents = async function(config) {

    let result = null;

    try {
        result = await httpClient.get(config['/elvanto/calendar-api'], {
            params: {
                'fields[0]': 'assets',
                'start': '2018-10-17',
                'end': '2018-12-17',
            },
            auth: {
                username: config['/elvanto/api-key'],
                password: 'x'
            },
            maxContentLength: 200000,
            timeout: 30000
        });

    } catch (error) {
        console.error(util.inspect(error));
        throw new Error(error);
    }

    if (result.data.error) {
        console.error(util.inspect(result.data.error));
        throw new Error(result.data.error.message);
    }

    console.log(util.inspect(result.data.events, {showHidden:false, depth:0}));

    return result.data;
};


/**
 * remove fields we don't want to expose: url and calendar_id
 * if we have 'Featured' as an asset, we set featured as a property flags on the object
 *
 * @param events
 */
exports.processEvents = function(events) {

    events.event.forEach(event => {
       delete event.url;
       delete event.calendar_id;

       let featured = false;
       if (event.assets) {
           if (event.assets.asset) {
               event.assets.asset.forEach(a => {
                  if (!featured && (a.name === 'Featured')) {
                      featured = true;
                      console.log("event: " + event.name + " is featured");
                  }
               });
            }
           delete event.assets;
       }
        event.featured = featured;
    });
};