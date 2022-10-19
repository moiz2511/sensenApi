'use strict';

const { User } = require("loopback");
// var ObjectId = require('mongodb').ObjectID;

module.exports = function (server) {
    var router = server.loopback.Router();
    router.get('/test2/:id',function(req,res){
      if(req.params.id){
        console.log(req.params.id)
        server.models.storeLocation.find({where:{id:req.params.id}},function (e, result) {
          if (e) return res.status(409).send({ 'status': 0, 'message': 'error', data: e });
          // else if (result) {
          //    return res.status(200).send({ 'status': 1, 'message': '' });
          // }

          })
        return res.status(200).send({
            'status': 200,
            'message': 'success'
          });
      }
      else{
        return res.status(409).send({ 'status': 0, 'message': 'id not found' });
      }
    })
    router.get('/userVerify', function (req, res) {
        if (req.query && req.query.id) {
            console.log(req.query.id)
            server.models.User.findOne({where:{email:req.query.id}}, function (e, userInstance) {
                if (e) return res.status(409).send({ 'status': 0, 'message': 'error', data: e });
                else if (userInstance) {
                    if (userInstance.emailVerified) {
                        return res.status(200).send({ 'status': 1, 'message': 'User already verified' });
                    } else {
                        userInstance.updateAttribute('emailVerified', true, function (err, result) {
                            if (err) return res.status(409).send({ 'status': 0, 'message': 'error', data: err });
                            else return res.status(409).send({ 'status': 0, 'message': 'user verified' });
                        })
                    }
                } else return res.status(409).send({ 'status': 0, 'message': 'user not found' });
            })
        } else {
            return res.status(409).send({ 'status': 0, 'message': 'id not found' });
        }
    });
    server.use(router);
};
