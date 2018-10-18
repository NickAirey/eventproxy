
process.env.AWS_REGION = 'ap-southeast-2';

let assert = require('assert');
let util = require('util');

let ssm_config = require('../config_aws_ssm');
let event_src = require('../events');
let rssxml = require('../rssxml');


describe('lambda rss integration tests', function() {

    this.timeout(15000);

    it('lambda request', async() => {

        try {
            // get config from SSM
            let config = await ssm_config.getConfig();

            let now = new Date();

            let endDateEvents = new Date(now);
            endDateEvents.setDate(endDateEvents.getDate()+14);

            let endDateFeatured = new Date(now);
            endDateFeatured.setDate(endDateFeatured.getDate()+90);

            // get source events
            let events = await event_src.getEvents(config, now, endDateFeatured);

            // postprocess events
            let processedEvents = event_src.processEvents(events.events, endDateEvents, endDateFeatured);

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