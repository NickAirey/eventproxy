
/*

    Author: Nick Airey

    some helper date handling functions

 */

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
};

Date.prototype.addDays = function(d) {
    this.setTime(this.getTime() + (d*24*60*60*1000));
    return this;
};

/**
 * returns the max of the dates or def if both null
 *
 * @param date1
 * @param date2
 * @param def
 */
exports.maxDate = function(date1, date2, def) {
    if (date1 == null) {
        return date2 == null ? def : date2;
    } else {
        if (date2 == null) {
            return date1;
        } else {
            return date1 > date2 ? date1 : date2
        }
    }
};


/**
 * return new date with days offset from base date, or null if offset days is not a positive int
 *
 * @param offsetDaysStr
 * @param baseDate
 * @returns {*}
 */
exports.getDateOffset = function (offsetDaysStr, baseDate) {
    if (typeof offsetDaysStr === "undefined" || offsetDaysStr === null) {
        console.error("invalid parameter "+offsetDaysStr);
        return null;
    }

    let offsetDaysInt = parseInt(offsetDaysStr);
    if (isNaN(offsetDaysInt) || offsetDaysInt < 0) {
        console.error("invalid parameter numeric value "+offsetDaysStr);
        return null;
    }

    let offsetDate = new Date(baseDate);
    offsetDate.addDays(offsetDaysInt);

    return offsetDate;
};