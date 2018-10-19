/**
 * Author: Nick Airey
 */

let ssm_config = require('config_aws_ssm');
let el_events = require('el_events');
let date_handling = require('date_handling');
let util = require('util');


/**
 * AWS API lambda handler
 *
 * the event parameter will contain a queryStringParameters attribute which contains the actual query params
 *
 * @param event
 * @returns {Promise<*>}
 */
exports.handler = async (event) => {
    try {
        let now = new Date();

        let endDateEvents = null;
        let endDateFeatured = null;

        if (! (event.queryStringParameters === undefined)) {
            console.log("queryStringParameters:" + util.inspect(event.queryStringParameters));

            // calculate end date for standard events
            endDateEvents = date_handling.getDateOffset(event.queryStringParameters.eventDays, now);

            // calculate end date for featured events
            endDateFeatured = date_handling.getDateOffset(event.queryStringParameters.featuredDays, now);
        }

        // calculate max of the two dates
        let maxEndDate = date_handling.maxDate(endDateEvents, endDateFeatured, now);

        // get config from SSM
        let config = await ssm_config.getConfig();

        // get source events
        let events = await el_events.getEvents(config, now, maxEndDate);

        // postprocess events
        let processedEvents = el_events.processEvents(events.events, endDateEvents, endDateFeatured);

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
            "headers": {
                'Access-Control-Allow-Origin': '*'
            },
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