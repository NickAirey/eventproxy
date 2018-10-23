/**
 * Author: Nick Airey
 */


let builder = require('xmlbuilder');

/**
 * convert event object to rss object
 *
 * @param event
 * @param feedUTCOffset
 * @returns {{item: {title: *, description: *, pubDate: *}}}
 */
exports.eventToRssItem = function (event, feedUTCOffset) {

    let featured = (typeof event.featured === "undefined") ? false: event.featured;

    return {
        item: {
            title: event.name,
            description: event.description,
            pubDate: new Date(event.start_date).toUTCString(),
            guid: { '@isPermaLink': false, '#text': event.id },
            category: { '@domain': 'featured', '#text': featured }
        }
    };
};

/*
    create a rss compliant xml string, merging the rssItems, the config and run date.
 */
exports.rssXmlBuilder = function(events, feedConfig, runDate) {

    let root = builder.create('rss')
        .att('version', '2.0').att('xmlns:atom', "http://www.w3.org/2005/Atom")
        .element('channel')
        .element('title', feedConfig["/organisation/general/name"]).up()
        .element('description', feedConfig["/organisation/events/feed-description"]).up()
        .element('link', feedConfig["/organisation/general/website-url"]).up()
        .element('pubDate', runDate.toUTCString()).up()
        .element('atom:link').att('href', feedConfig["/organisation/events/feed-url"]).att('rel', 'self').att('type', 'application/rss+xml').up();

    // convert each event to rss format and add to xml builder root context
    events.forEach( e => {
        root.element(exports.eventToRssItem(e));
    });

    return root.end({pretty: true});
};
