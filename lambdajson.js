/**
 * Author: Nick Airey
 */

let ssm_config = require('config_aws_ssm');
let event_src = require('events');
let util = require('util');

/**
 * AWS API lambda handler
 *
 * @param event
 * @returns {Promise<*>}
 */
exports.handler = async (event) => {
    try {
        let now = new Date();

        let endDateEvents = new Date(now);
        endDateEvents.setDate(endDateEvents.getDate()+14);

        let endDateFeatured = new Date(now);
        endDateFeatured.setDate(endDateFeatured.getDate()+60);

        let maxEndDate = event_src.maxDate(endDateEvents, endDateFeatured, now);

        // get config from SSM
        let config = await ssm_config.getConfig();

        // get source events
        let events = await event_src.getEvents(config, now, maxEndDate);

        // postprocess events
        let processedEvents = event_src.processEvents(events.events, endDateEvents, endDateFeatured);

        // package result
        let processedEventResult = {
            events: {
                total: processedEvents.length,
                event: processedEvents
            }
        };

        // package result in AWS API format
        let result = {
            "statusCode": 200,
            "headers": {'Content-Type': 'text/xml'},
            "body": JSON.stringify(processedEventResult)
        };

        console.log(util.inspect(result, {showHidden:false, depth:5}));
        return result;
    }
    catch(err) {
        console.error(util.inspect(err, {showHidden:false, depth:5}));
        return {"statusCode": 503, "body": "error processing request"};
    }
};