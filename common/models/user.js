'use strict';
var base64 = require('base-64');
var utf8 = require('utf8');
var _ = require('lodash');
const transporterservice = require('../../lib/transporterservice');
var startNo = '321213';
var endNo = '5434354';
var config = require('../../server/config.json');
var server = require('../../server/server');
module.exports = function (User) {
    var randomNumber = function () {
        var number = '';
        for (var i = 0; i < 4; i++) {
            number += Math.floor(Math.random() * 9);
        }
        return number;
    }
    // Hooks
    User.observe('before save', function (ctx, next) {
        if (ctx.isNewInstance) {
            let emailParams = {
                to: ctx.instance.email,
                subject: "Welcome to the sensen",
                text: "Let's dig in", //needs to change content
                html: "<a href=" + config.baseUrl + "userVerify?id=" + ctx.instance.email + ">Click to Verify</a>" //needs to change content
            }
            transporterservice.sendEmail(emailParams, next)
            // next();

        } else {
            next();
        }
    });

    User.validateUser = function (val, fn) {
        if (val == undefined) cb('Incorrect Email', null);
        User.find({
            where: { 'email': val }
        }, function (err, data) {
            if (err) fn(err);
            else {
                if (data.length == 0)
                    fn('You are not Registered');
                else {
                    var otp = randomNumber();
                    var bytes = utf8.encode(startNo + otp + endNo);
                    var encoded = base64.encode(bytes);
                    // send this otp to mail/phone number 
                    let otp_text = 'your otp :' + otp
                    let emailParams = {
                        to: data[0].email,
                        subject: "OTP from sensen",
                        text: "Let's dig in", //needs to change content
                        html: otp_text //needs to change content
                    }
                    transporterservice.sendEmail(emailParams, fn)





                    // if (data[0].username.length == 10)
                    //     var phoneNumber = '91' + data[0].username
                    // else if (data[0].username.length == 12)
                    //     var phoneNumber = data[0].username
                    // else
                    //     fn('not valid phone number')
                    // transporterservice.sendMobileOTP(phoneNumber, otp_text, function (e) {
                    //     if (e) fn(e)
                    //     var cotp = {
                    //         cotp: encoded,
                    //         otp: otp,
                    //         user: data[0]
                    //     }
                    //     fn(null, cotp)
                    // })
                }
            }
        });
    }
    User.updatePassword = function (data, cb) {
        if (data.userId && data.password) {
            try {
                this.findOne({
                    where: {
                        id: data.userId
                    }
                }, function (err, user) {
                    if (err) cb(err);
                    else if (!user) cb("NO USER FOUND");
                    else {
                        user.updateAttributes({
                            'password': data.password
                        }, function (err, inst) {
                            if (err) {
                                cb(err);
                            } else {
                                cb(null, 'password updated successfully');
                            }
                        });
                    }
                });
            } catch (err) {
                cb(err);
            }
        } else {
            cb(new Error("In valid data"))
        }
    }
    User.updatePasswordWithOldPassword = function (data, cb) {
        if (data.userId && data.password && data.oldPassword) {
            try {
                this.findOne({
                    where: {
                        id: data.userId
                    }
                }, function (err, user) {
                    if (err) cb(err);
                    else if (!user) cb(new Error("NO USER FOUND"), null);
                    else {
                        let tempUserName = {};
                        if (user.username)
                            tempUserName['username'] = user.username;
                        if (user.email)
                            tempUserName['email'] = user.email;
                        if (data.oldPassword)
                            tempUserName['password'] = data.oldPassword;

                        User.login(tempUserName, function (e, s) {
                            if (e)
                                cb(new Error("Wrong Old Password"), null)
                            else {
                                user.updateAttributes({
                                    'password': data.password
                                }, function (err, inst) {
                                    if (err) {
                                        cb(err);
                                    } else {
                                        cb(null, { message: "password changed successfully", statusCode: 200 });
                                    }
                                });
                            }
                        })
                    }
                });
            } catch (err) {
                cb(err);
            }
        } else {
            cb(new Error("In valid data"))
        }

    }

    User.validateOTP = function (otp, cotp, cb) {
        var decode = base64.decode(cotp);
        var cnfOtp = decode.substr(6, 4);
        if (base64.encode(otp) == base64.encode(cnfOtp)) cb(null, 'OK');
        else
            cb('FAILED');
    }
    User.updateRole = function (data, cb) {
        if (data.userId && data.role) {
            try {
                this.findOne({
                    where: {
                        id: data.userId
                    }
                }, function (err, user) {
                    if (err) cb(err);
                    else if (!user) cb("NO USER FOUND");
                    else {
                        if (user.role && user.role.length > 0) {
                            user.role.push(data.role);
                            var UpdatedRole = user.role
                        } else {
                            var UpdatedRole = []
                            UpdatedRole.push(data.role)
                        }
                        UpdatedRole = _.uniq(UpdatedRole);
                        UpdatedRole = _.compact(UpdatedRole);
                        user.updateAttributes({
                            'role': UpdatedRole
                        }, function (err, inst) {
                            if (err) {
                                cb(err);
                            } else {
                                cb(null, 'Role updated successfully');
                            }
                        });
                    }
                });
            } catch (err) {
                cb(err);
            }
        } else {
            cb(new Error("In valid data"))
        }
    }
    User.deleteRole = function (data, cb) {
        if (data.userId && data.role) {
            try {
                this.findOne({
                    where: {
                        id: data.userId
                    }
                }, function (err, user) {
                    if (err) cb(err);
                    else if (!user) cb("NO USER FOUND");
                    else {
                        if (user.role && user.role.length > 0) {
                            var UpdatedRole = _.remove(user.role, function (n) {
                                return n !== data.role;
                            });
                        } else {
                            cb("NO ROLE FOUND")
                        }
                        UpdatedRole = _.uniq(UpdatedRole);
                        UpdatedRole = _.compact(UpdatedRole);
                        user.updateAttributes({
                            'role': UpdatedRole
                        }, function (err, inst) {
                            if (err) {
                                cb(err);
                            } else {
                                cb(null, 'Role removed successfully');
                            }
                        });
                    }
                });
            } catch (err) {
                cb(err);
            }
        } else {
            cb(new Error("In valid data"))
        }
    }

    User.remoteMethod('updateRole', {
        description: 'update a user\'s Role.',
        accepts: {
            arg: 'data',
            type: 'object',
            description: '{"userId":"xxxx","role":"new role"}',
            http: {
                source: 'body'
            }
        },
        returns: {
            arg: 'data',
            type: 'object'
        },
        http: {
            verb: 'POST',
            path: '/updateRole'
        },
    });
    User.remoteMethod('deleteRole', {
        description: 'delete a user\'s Role.',
        accepts: {
            arg: 'data',
            type: 'object',
            description: '{"userId":"xxxx","role":" role to delete"}',
            http: {
                source: 'body'
            }
        },
        returns: {
            arg: 'data',
            type: 'object'
        },
        http: {
            verb: 'POST',
            path: '/deleteRole'
        },
    });

    User.remoteMethod('validateOTP', {
        description: "validateOTP",
        returns: {
            arg: 'data',
            type: 'object'
        },
        accepts: [{
            arg: 'otp',
            type: 'string',
            description: "OTP from mobile/email",
            required: true,
            http: {
                source: 'query'
            }
        },
        {
            arg: 'cotp',
            type: 'string',
            description: "encrypted OTP",
            required: true,
            http: {
                source: 'query'
            }
        }
        ],
        http: {
            path: '/validateOTP',
            verb: 'get'
        }
    });
    User.remoteMethod('validateUser', {
        description: "validate User",
        returns: {
            arg: 'data',
            type: 'object'
        },
        accepts: [{
            arg: 'val',
            type: 'string',
            description: '{val:phone number/email}',
            required: true,
            http: {
                source: 'query'
            }
        }],
        http: {
            path: '/validateUser',
            verb: 'get'
        }
    });
    User.remoteMethod('updatePassword', {
        description: 'update a user\'s password.',
        accepts: {
            arg: 'data',
            type: 'object',
            description: '{"userId":"xxxx","password":"new password"}',
            http: {
                source: 'body'
            }
        },
        returns: {
            arg: 'data',
            type: 'object'
        },
        http: {
            verb: 'POST',
            path: '/updatePassword'
        },
    });
    User.remoteMethod('updatePasswordWithOldPassword', {
        description: 'update a user\'s password with Old Password.',
        accepts: {
            arg: 'data',
            type: 'object',
            description: '{"userId":"xxxx","password":"current password","oldPassword":"old password"}',
            http: {
                source: 'body'
            }
        },
        returns: {
            arg: 'data',
            type: 'object'
        },
        http: {
            verb: 'POST',
            path: '/updatePasswordWithOldPassword'
        },
    });
    //update user info by user id
    User.updateUserInfoByUserId = function (data, cb) {
        if (data.userId) {
            try {
                data['id'] = data.userId;
                this.upsert(data, cb);
            } catch (err) {
                cb(err);
            }
        } else {
            cb(new Error("In valid data"))
        }
    }
    User.remoteMethod('updateUserInfoByUserId', {
        description: 'update a user\'s info by user id.',
        accepts: {
            arg: 'data',
            type: 'object',
            description: `{"userId":"xxxx","user":"{
                "firstName": "string",
            "lastName": "string",
            "language": "string",
            "notification": true,
            "email": "string"
        }"}`,
            http: {
                source: 'body'
            }
        },
        returns: {
            arg: 'data',
            type: 'object'
        },
        http: {
            verb: 'POST',
            path: '/updateUserInfoByUserId'
        },
    });

};
