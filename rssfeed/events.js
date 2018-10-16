/**
 Author: Nick Airey
 **/

let axios = require('axios');

exports.getEvents = async function(config) {

    const httpClient = axios.create({
        timeout: 5000,
        maxContentLength: 20000
    });


    let apiKey = config['/elvanto/api-key'];
    let url = config['/elvanto/calendar-api'];

    let result = await httpClient.get(url, {
        params: {
            'fields[0]': 'assets'
        },
        auth: {
            username: 'x',
            password: apiKey
        }
    });

    return result.data;


/*
        unirest.get('https://api.elvanto.com/v1/calendar/events/getAll.xml')
            .auth(auth, 'x', true)
            .query(queryObject)
            .query('fields\[0\]=assets')
            .end((response) => {
                if (response.error) {
                    reject(response.error);
                }
                if (response.status >= 200 && response.status < 300) {
                    resolve(response.body);
                }
                reject(response.body);
            });
*/
};
