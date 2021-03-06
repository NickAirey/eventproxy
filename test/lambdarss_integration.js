
process.env.AWS_REGION = 'ap-southeast-2';

let assert = require('assert');
let util = require('util');

let ssm_config = require('../config_aws_ssm');
let el_events = require('../el_events');
let rssxml = require('../rssxml');
let date_handling = require('../date_handling');

describe('lambda rss integration tests', function() {

    this.timeout(15000);

    it('lambda request', async() => {

        try {
            let now = new Date(2018,10,3);

            let endDateEvents = new Date(now);
            endDateEvents.setDate(endDateEvents.getDate()+7);

            let endDateFeatured = new Date(now);
            endDateFeatured.setDate(endDateFeatured.getDate()+7);

            let maxEndDate = date_handling.maxDate(endDateEvents, endDateFeatured, now);

            // get config from SSM
            let config = await ssm_config.getConfig();

            // get source events
            let events = await el_events.getEvents(config, now, maxEndDate);

            // postprocess events
            let processedEvents = el_events.processEvents(events.events, endDateEvents, endDateFeatured);

            // construct rssXml from events and config, rundate is now
            let rssXml = rssxml.rssXmlBuilder(processedEvents, config, now);

            console.log(rssXml);

            assert.ok(rssXml);

        } catch(err) {
            console.error(util.inspect(err));
            assert.fail(err);
        }
    })
});