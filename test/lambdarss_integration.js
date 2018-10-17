
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

            // get source events
            let events = await event_src.getEvents(config);

            // postprocess events
            event_src.processEvents(events.events);

            // construct rssXml from events and config, rundate is now
            let rssXml = rssxml.rssXmlBuilder(events.events, config, new Date());

            console.log(rssXml);

            assert.ok(rssXml);

        } catch(err) {
            console.error(util.inspect(err));
            assert.fail(err);
        }
    })
});