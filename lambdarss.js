/**
 * Author: Nick Airey
 */

let ssm_config = require('config_aws_ssm');
let rssxml = require('rssxml');
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

        let maxEventDate = (endDateEvents > endDateFeatured) ? endDateEvents : endDateFeatured;

        // get config from SSM
        let config = await ssm_config.getConfig();

        // get source events
        let events = await event_src.getEvents(config, now, maxEventDate);

        // postprocess events
        let processedEvents = event_src.processEvents(events.events, endDateEvents, endDateFeatured);

        // construct rssXml from processed events, config and run date
        let rssXml = rssxml.rssXmlBuilder(processedEvents, config, now);

        // package rssXml in AWS API format
        let result = {"statusCode": 200, "headers": {'Content-Type': 'text/xml'}, "body": rssXml};

        console.log(util.inspect(result, {showHidden:false, depth:5}));
        return result;
    }
    catch(err) {
        console.error(util.inspect(err, {showHidden:false, depth:5}));
        let result = {"statusCode": 503, "body": "error processing request"};
        return result;
    }
};