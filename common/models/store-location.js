'use strict';

module.exports = function(Storelocation) {
  Storelocation.getZipCodeLocs = function(zip,cb) {

    // var currentDate = new Date();
    // var currentHour = currentDate.getHours();
    // var OPEN_HOUR = 6;
    // var CLOSE_HOUR = 20;
    // console.log('Current hour is %d', currentHour);
    // var response;
    // if (currentHour >= OPEN_HOUR && currentHour < CLOSE_HOUR) {
    //   response = 'We are open for business.';
    // } else {
    //   response = 'Sorry, we are closed. Open daily from 6am to 8pm.';
    // }
    // cb(null, response);
    Storelocation.findById( zip, function (err, instance) {
      var response = "Name of coffee shop is " + instance.StoreName;
      cb(null, response);
      console.log(response);
  });
  };
  Storelocation.remoteMethod(
    'getZipCodeLocs', {
      http: {
        path: '/getZipCodeLocs',
        verb: 'get'
      },
      accepts: {arg: 'id', type: 'number', required: true, http: { source: 'query' } },
      returns: {
        arg: 'status',
        type: 'string'
      }
    }
  );
};
