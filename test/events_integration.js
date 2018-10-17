
let assert = require('assert');
let fs = require('fs');
let eventSource = require('../events');
let util = require('util');

describe('integration tests', function() {

    this.timeout(15000);

    it('retrieve events', async () => {

        let config = JSON.parse(fs.readFileSync('test/config_integration.json'));

        // get source events
        let events = await eventSource.getEvents(config);

        assert.ok(events != null);

        eventSource.processEvents(events.events);

        console.log(util.inspect(events, {showHidden:false, depth:8}));

    });
});
