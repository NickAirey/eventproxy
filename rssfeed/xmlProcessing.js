
let libxslt = require('libxslt');
let libxmljs = libxslt.libxmljs;


// 1. find all events with assets/asset/name = MajorEvent
//      replace the first date char with "1"
// 2. remove all elements with date > max event date

exports.preprocessEvents = function(xmlInputStr) {
    console.log("start processing major events");

    let xmlDoc = libxmljs.parseXml(xmlInputStr, { noblanks: true });
    xmlDoc.find('/rsp/events/event[assets/asset/name = "MajorEvent"]').forEach(event => {
        console.log("Major event: "+event.get('name').text()+ " "+event.get('start_date').text());
        let start_date_element = event.get('start_date');
        start_date_element.text("1"+start_date_element.text().slice(1));
    });
    
    xmlDoc.find('/rsp/events/event[number(translate(start_date,"- :","")) > 20180527070000]').forEach(event => { 
        console.log("removing: "+event.get('name').text()+ " "+event.get('start_date').text());
        event.remove();
    });
    
    console.log("finished processing major events");
    return xmlDoc;
};
    

/*
   this is a nasty hack to add 10 hours to a UTC date str
*/
function addTZOffsetAndConvertToISOStr(dateStr) {
    const OFFSET_HOURS = 10;
    var date1 = new Date(dateStr);
    date1.setHours(date1.getHours()+OFFSET_HOURS);
    let date1UTCStr = date1.toUTCString();
    return date1UTCStr.substring(0, date1UTCStr.length-4)+" +"+OFFSET_HOURS+"00";
}

function addTZOffsetAndConvertToISOElement(dateElement) {
    dateElement.text(addTZOffsetAndConvertToISOStr(dateElement.text()));
}


// takes xmlInput document. Postprocess xml to 
//     restore major events to the "2" in their first date char
//     convert dates to ISO format and convert from UTC to local TZ
//     
exports.postProcessEvents = function (xmlDoc) {

    xmlDoc.find('/rss/channel/item[number(translate(pubDate,"- :","")) < 20180521000000]').forEach(item => { 
        console.log("Major Event: "+item.get('title').text());
        
        let pubDateElement = item.get('pubDate');
        pubDateElement.text("2"+pubDateElement.text().slice(1));
    });

    addTZOffsetAndConvertToISOElement(xmlDoc.get('/rss/channel/pubDate'));
    xmlDoc.find('/rss/channel/item/pubDate').forEach(element => addTZOffsetAndConvertToISOElement(element));
    
    return xmlDoc.toString();    
};