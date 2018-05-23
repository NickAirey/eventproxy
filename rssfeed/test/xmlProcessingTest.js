
let xml = require('../xmlProcessing');
let fs = require('fs');

let assert = require('chai').assert;
let libxslt = require('libxslt');
let libxmljs = libxslt.libxmljs;

Date.prototype.addDays = function(d) {    
   this.setTime(this.getTime() + d*24*60*60*1000); 
   return this;   
};



describe('#xmlProcessEvents() tests', function () {
    it("preProcessing", function () {
        
        let eventsXmlInStr = fs.readFileSync("testEvents.in.xml", "utf8");
        let eventsXmlOut = libxmljs.parseXml(fs.readFileSync("testEvents.out.xml", "utf8"));
        
        let d = new Date('2018-05-27');
        let d2 = new Date(d).addDays(1);
        
        console.log(d);
        console.log(d2);
        xml.setDates(d, d2);
        
        assert.equal(xml.preprocessEvents(eventsXmlInStr).toString(), eventsXmlOut.toString(), 'event xml date processing');
    });
    
    it("postProcessing", function () {
        
        let rssXmlInDoc = libxmljs.parseXml(fs.readFileSync("testRss.in.xml", "utf8"));
        let rssXmlOut = fs.readFileSync("testRss.out.xml", "utf8");
        
        assert.equal(xml.postProcessEvents(rssXmlInDoc), rssXmlOut.toString(), 'rss xml date processing');
    });
});