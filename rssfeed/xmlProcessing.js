
let libxslt = require('libxslt');
let libxmljs = libxslt.libxmljs;

var maxStandardEventStr = "";
var todayDateStr = "";

const AEST_OFFSET_HRS = 10;

Date.prototype.addHours = function(h) {    
   this.setTime(this.getTime() + (h*60*60*1000)); 
   return this;   
};

exports.setDates = function(todayDate, maxStandardEventDate) {
    todayDateStr = ""+todayDate.getFullYear()+ ("0"+(todayDate.getMonth()+1)).slice(-2) + ("0"+todayDate.getDate()).slice(-2) + "000000";
    console.log("todayDate xml: "+todayDateStr);
    
    maxStandardEventStr = ""+maxStandardEventDate.getFullYear()+ ("0"+(maxStandardEventDate.getMonth()+1)).slice(-2) + ("0"+maxStandardEventDate.getDate()).slice(-2) + "000000";
    console.log("maxStandardEventStr xml: "+maxStandardEventStr);
};


function addTZOffsetISOElement(element) {
    var date = new Date(element.text());
    date.addHours(AEST_OFFSET_HRS);
    element.text(date.toISOString().slice(0, -5).replace("T", " "));
}

function setAsUTCElement(element) {
    var date = new Date(element.text());
    let dateUTCStr = date.toUTCString();
    element.text(dateUTCStr.substring(0, dateUTCStr.length-4)+" +"+AEST_OFFSET_HRS+"00");
}


// 1. find all events with assets/asset/name = MajorEvent
//      replace the first date char with "1"
// 2. remove all elements with date > max standard event date

exports.preprocessEvents = function(xmlInputStr) {
    console.log("Start preprocessing events ");

    // parse xml
    let xmlDoc = libxmljs.parseXml(xmlInputStr, { noblanks: true });
    
    // update all dates to local timezone
    xmlDoc.find('/rsp/events/event/start_date').forEach(addTZOffsetISOElement);
    
    xmlDoc.find('/rsp/events/event/end_date').forEach(addTZOffsetISOElement);
    
    xmlDoc.find('/rsp/events/event[assets/asset/name = "MajorEvent"]').forEach(event => {
        console.log("Shifting major event: "+event.get('name').text()+ " "+event.get('start_date').text());
        let start_date_element = event.get('start_date');
        start_date_element.text("1"+start_date_element.text().slice(1));
    });
    
    console.log("Removing events with date > "+maxStandardEventStr);
    xmlDoc.find('/rsp/events/event[number(translate(start_date,"- :","")) > '+maxStandardEventStr+']').forEach(event => { 
        console.log("Removing event: "+event.get('name').text()+ " "+event.get('start_date').text());
        event.remove();
    });
    
    console.log("Finished preprocessing events");
    return xmlDoc;
};
    

// takes xmlInput document. Postprocess xml to 
//     restore events earler than today
//     convert dates to ISO format and convert from UTC to local TZ
//     
exports.postProcessEvents = function (xmlDoc) {
    console.log("Start postprocessing events");
    
    console.log("Restoring events with date < "+todayDateStr);
    xmlDoc.find('/rss/channel/item[number(translate(pubDate,"- :","")) < '+todayDateStr+']').forEach(item => { 
        console.log("Restoring major event: "+item.get('title').text());
        
        let pubDateElement = item.get('pubDate');
        pubDateElement.text("2"+pubDateElement.text().slice(1));
    });

    var pubDate = xmlDoc.get('/rss/channel/pubDate');
    pubDate.text(new Date().toISOString());
    setAsUTCElement(pubDate);
    
    xmlDoc.find('/rss/channel/item/pubDate').forEach(setAsUTCElement);
    
    console.log("Finshed postprocessing events");
    return xmlDoc.toString();    
};
