
let assert = require('assert');
let date_handling = require('../date_handling');

describe('date offset', () => {

    it('date offset calcs', () => {

        let queryStringParameters = {
            daySample: 14
        };

        let base = new Date();
        let ref = new Date(base);
        ref.setTime(ref.getTime() + (14 * 24 * 60 * 60 * 1000));

        assert.equal(date_handling.getDateOffset(queryStringParameters.daySample, base).getTime(), ref.getTime());
    });

    it('date offset calcs string', () => {

        let queryStringParameters = {
            daySample: '14'
        };

        let base = new Date();
        let ref = new Date(base);
        ref.setTime(ref.getTime() + (14 * 24 * 60 * 60 * 1000));

        assert.equal(date_handling.getDateOffset(queryStringParameters.daySample, base).getTime(), ref.getTime());
    });

    it('defaults', () => {

        let queryStringParameters = {};

        assert.equal(date_handling.getDateOffset(queryStringParameters.daySample, {}), null);
    });

    it('bad parameters', () => {

        let queryStringParameters = {
            daySample: -1
        };

        assert.equal(date_handling.getDateOffset(queryStringParameters.daySample, {}), null);
    });

    it('bad parameters2', () => {

        let queryStringParameters = {
            daySample: 1.5
        };

        let base = new Date();
        let ref = new Date(base);
        ref.setTime(ref.getTime() + (24 * 60 * 60 * 1000));

        assert.equal(date_handling.getDateOffset(queryStringParameters.daySample, base).getTime(), ref.getTime());
    });

    it('bad parameters3', () => {

        let queryStringParameters = {
            daySample: "hello"
        };

        assert.equal(date_handling.getDateOffset(queryStringParameters.daySample, {}), null);
    });
});

describe('max dates', () => {

    it('max date all null', () => {
        let now = new Date();
        assert.equal(date_handling.maxDate(null, null, now), now);
    });

    it('max date, one defined', () => {
        let now = new Date();
        assert.equal(date_handling.maxDate(now, null, null), now);
        assert.equal(date_handling.maxDate(null, now, null), now);
    });

    it('max date, both defined', () => {
        let now = new Date();
        let after = new Date(now);
        after.setDate(after.getDate()+1);

        assert.equal(date_handling.maxDate(now, after, null), after);
        assert.equal(date_handling.maxDate(after, now, null), after);
    });
});