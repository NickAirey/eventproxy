
process.env.AWS_REGION = 'ap-southeast-2';

let assert = require('assert');
let util = require('util');

let ssm_config = require('../config_aws_ssm');
let el_events = require('../el_events');


describe('lambda rss integration tests', function() {

    this.timeout(15000);

    it('lambda request', async() => {

        try {
            let now = new Date(2018,10,3);

            let endDateEvents = new Date(now);
            endDateEvents.setDate(endDateEvents.getDate()+7);

            let endDateFeatured = new Date(now);
            endDateFeatured.setDate(endDateFeatured.getDate()+7);

            let maxEndDate = el_events.maxDate(endDateEvents, endDateFeatured, now);

            // get config from SSM
            let config = await ssm_config.getConfig();

            // get source events
            let events = await el_events.getEvents(config, now, maxEndDate);

            // postprocess events
            let processedEvents = el_events.processEvents(events.events, endDateEvents, endDateFeatured);

            assert.ok(processedEvents);

            // package result
            let processedEventsResult = {
                events: {
                    total: processedEvents.length,
                    event: processedEvents
                }
            };

            console.log(JSON.stringify(processedEventsResult));

        } catch(err) {
            console.error(util.inspect(err));
            assert.fail(err);
        }
    })
});