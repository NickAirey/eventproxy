'use strict';

var util=require('util');

console.log('Loading function');

exports.handler = function(event, context, callback) {

  console.log(util.inspect(event));

  if (event.body) {
    event = JSON.parse(event.body);
  }

  console.log('value1 =', event.key1);
  console.log('value2 =', event.key2);
  console.log('value3 =', event.key3);

  const response = {
    statusCode: 200,
    headers: { "Content-type": "application/json" },
    body: JSON.stringify( { "message": event.key1 } )
  };

  console.log(util.inspect(response));

  callback(null, response);
};