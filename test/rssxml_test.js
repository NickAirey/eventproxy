
let assert = require('assert');
let fs = require('fs');
let date_handling = require('../date_handling');
let rssxml = require('../rssxml');


describe('object conversion', () => {

    it('item generation', () => {

        let event = {
            "id": "52139416-ff4d-11e2-847a-46e7b7dc2836",
            "name": "Church Picnic",
            "description": "Come down and enjoy a fun family picnic!",
            "where": "The Park",
            "start_date": "2018-06-03 04:00:00",
            "featured": true
        };

        let rssItemRef = {
            item: {
                title: "Church Picnic",
                description: "Come down and enjoy a fun family picnic!",
                pubDate: "Sun, 03 Jun 2018 14:00:00 +1000",
                guid: {
                    '#text': "52139416-ff4d-11e2-847a-46e7b7dc2836",
                    '@isPermaLink': false
                },
                category: {
                    '#text': true,
                    '@domain': "featured"
                }
            }
        };

        assert.deepEqual(rssxml.eventToRssItem(event, "10"), rssItemRef);
    });

    it('full rss xml generation', () => {
        let events = fs.readFileSync('test/testEvents.in.json', 'utf-8');
        assert.equal(events != null, true);

        let config = fs.readFileSync('test/config_test.json', 'utf-8');

        let xmlGenerated = rssxml.rssXmlBuilder(JSON.parse(events).events.event, JSON.parse(config), new Date(2018, 4, 30, 9));

        let xmlReference = fs.readFileSync('test/testRss.out.xml', 'utf-8');

        assert.deepEqual(xmlGenerated, xmlReference);
    });

});