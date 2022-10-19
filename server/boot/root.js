'use strict';
const { storeLocation } = require("loopback");
module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.post('/testString/:id', function(req,res){
    console.log(req.params.id)
    // const data=User.findById()
    const response=storeLocation.find({
      where: {
        id: req.params.id,
        response
    }
    })
    res.send({
      status:'das',

    })
  })
  router.get('/', server.loopback.status());

  server.use(router);
};
