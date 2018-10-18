
let assert = require('assert');
let events = require('../events');

describe('events unit tests', () => {

    it('max date all null', () => {
        let now = new Date();
        assert.equal(events.maxDate(null, null, now), now);
    });

    it('max date, one defined', () => {
        let now = new Date();
        assert.equal(events.maxDate(now, null, null), now);
        assert.equal(events.maxDate(null, now, null), now);
    });

    it('max date, both defined', () => {
        let now = new Date();
        let after = new Date(now);
        after.setDate(after.getDate()+1);

        assert.equal(events.maxDate(now, after, null), after);
        assert.equal(events.maxDate(after, now, null), after);
    });
});