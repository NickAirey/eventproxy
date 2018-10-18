
let assert = require('assert');
let fs = require('fs');
let eventSource = require('../events');
let util = require('util');

describe('integration tests', function() {

    this.timeout(15000);

    it('retrieve events', async () => {

        let config = JSON.parse(fs.readFileSync('test/config_integration.json'));

        // get source events
        let events = await eventSource.getEvents(config, new Date("2018-10-20"), new Date("2018-12-20"));

        assert.ok(events != null);

        let processedEvents = eventSource.processEvents(events.events, new Date("2018-10-25"), new Date("2018-12-20"));

        console.log(util.inspect(processedEvents, {showHidden:false, depth:8}));

    });
});
