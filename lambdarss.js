/**
 * Author: Nick Airey
 */

let ssm_config = require('config_aws_ssm');
let rssxml = require('rssxml');
let events = require('events');
let util = require('util');

/**
 * AWS API lambda handler
 *
 * @param event
 * @returns {Promise<*>}
 */
exports.handler = async (event) => {
    try {
        // get config from SSM
        let config = await ssm_config.getConfig();

        // get source events
        let events = await events.getEvents(config);

        // construct rssXml from events and config, rundate is now
        let rssXml = rssxml.rssXmlBuilder(events, config, Date.UTC());

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