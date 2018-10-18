
let assert = require('assert');
let fs = require('fs');
let el_events = require('../el_events');
let util = require('util');

describe('integration tests', function() {

    this.timeout(15000);

    it('retrieve events', async () => {

        let config = JSON.parse(fs.readFileSync('test/config_integration.json'));

        // get source events
        let events = await el_events.getEvents(config, new Date("2018-10-20"), new Date("2018-12-20"));

        assert.ok(events != null);

        let processedEvents = el_events.processEvents(events.events, new Date("2018-10-25"), new Date("2018-12-20"));

        console.log(util.inspect(processedEvents, {showHidden:false, depth:8}));

    });
});
