/**
 Author: Nick Airey
 **/

let httpClient = require('axios');
let util = require('util');

/**
 *
 * @param config
 * @param startDate
 * @param endDate
 * @returns {Promise<*>}
 */
exports.getEvents = async function(config, startDate, endDate) {

    if (typeof startDate === "undefined" || typeof endDate === "undefined") {
        throw new Error("invocation parameters missing");
    }

    if ( !(startDate instanceof Date && endDate instanceof Date)) {
        throw new Error("parameters must be dates");
    }

    let paramsObj = {
        'fields[0]': 'assets',
        'start': startDate.toISOString().substr(0,10),
        'end': endDate.toISOString().substr(0,10)
    };

    console.log("params: "+util.inspect(paramsObj));
    let response = null;

    try {
        response = await httpClient.get(config['/elvanto/calendar-api'], {
            params: paramsObj,
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

    switch (response.data.status) {
        case 'ok':
            console.log("response: "+util.inspect(response.data.events, {showHidden:false, depth:0}));
            return response.data;
            break;

        case 'fail':
            if (response.data.error.code === 404) {
                console.log(response.data.error.message);
                // we'll return an empty object here rather than throwing an error
                return {
                    events: {
                        event: []
                    }
                }
            } else {
                console.error(util.inspect(response.data.error));
                throw new Error(response.data.error.message);
            }
            break;

        default:
            throw new Error('unknown response code');
    }
};


/**
 * remove fields we don't want to expose: url and calendar_id
 * if we have 'Featured' as an asset, we set featured as a property flags on the object
 *
 * @param events
 * @param eventMaxDate
 * @param featuredMaxDate
 */
exports.processEvents = function(events, eventMaxDate, featuredMaxDate) {

    if (eventMaxDate!=null && !(eventMaxDate instanceof Date)) {
        throw new Error("eventMaxDate must be a Date object");
    }

    if (featuredMaxDate!=null && !(featuredMaxDate instanceof Date)) {
        throw new Error("featuredMaxDate must be a Date object");
    }

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

    console.log("eventMaxDate: "+eventMaxDate + ", featuredMaxDate: "+featuredMaxDate);

    return events.event.filter(e => {
        if (e.featured) {
            return (featuredMaxDate!=null && new Date(e.start_date) <= featuredMaxDate)
        } else {
            return (eventMaxDate!=null && new Date(e.start_date) <= eventMaxDate)
        }
    });
};