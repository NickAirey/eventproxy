/**
 * Author: Nick Airey
 */

let AWS = require('aws-sdk');

exports.getConfig = async function() {

    return new Promise( (resolve, reject) => {

        const keyList = [
            "/organisation/general/name",
            "/organisation/general/website-url",
            "/organisation/events/feed-description",
            "/organisation/events/feed-url",
            '/organisation/events/date-utc-offset',
            "/elvanto/calendar-api",
            "/elvanto/api-key"
        ];

        let ssm = new AWS.SSM({region: process.env.AWS_REGION});

        let params = {
            Names: keyList,
            WithDecryption: false
        };

        ssm.getParameters(params, function (err, data) {
            if (err) {
                reject(err.message);
            } else {
                if (data.InvalidParameters.length > 0) {
                    reject('error retrieving parameter: ' + data.InvalidParameters);
                }

                // convert to an object curr.Name: curr.Value
                resolve(data.Parameters.reduce( (acc, curr) => {
                    return Object.assign(acc, {[curr.Name]: curr.Value})
                }, {}));
            }
        });
    });
};