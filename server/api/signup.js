'use strict';
const Async = require('async');
const Boom = require('boom');
const Config = require('../../config');
const Joi = require('joi');


const internals = {};


internals.applyRoutes = function (server, next) {

    const Account = server.plugins['hapi-mongo-models'].Account;
    const Session = server.plugins['hapi-mongo-models'].Session;
    const User = server.plugins['hapi-mongo-models'].User;


    server.route({
        method: 'POST',
        path: '/signup',
        config: {
            validate: {
                payload: {
                    name: Joi.string().required(),
                    email: Joi.string().email().lowercase().required(),
                    username: Joi.string().token().lowercase().required(),
                    mobile: Joi.any().optional(),
                    town: Joi.any().optional(),
                    avatar: Joi.string().required()
                }
            },
            pre: [{
                assign: 'usernameCheck',
                method: function (request, reply) {

                    //generate Password
                    var generatePassword = require("password-generator");

                    var maxLength = 10;
                    var minLength = 6;
                    var uppercaseMinCount = 2;
                    var lowercaseMinCount = 2;
                    var numberMinCount = 1;
                    var specialMinCount = 1;
                    var UPPERCASE_RE = /([A-Z])/g;
                    var LOWERCASE_RE = /([a-z])/g;
                    var NUMBER_RE = /([\d])/g;
                    var SPECIAL_CHAR_RE = /([\?\-])/g;
                    var NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;

                    function isStrongEnough(password) {
                        var uc = password.match(UPPERCASE_RE);
                        var lc = password.match(LOWERCASE_RE);
                        var n = password.match(NUMBER_RE);
                        var sc = password.match(SPECIAL_CHAR_RE);
                        var nr = password.match(NON_REPEATING_CHAR_RE);
                        return password.length >= minLength &&
                            !nr &&
                            uc && uc.length >= uppercaseMinCount &&
                            lc && lc.length >= lowercaseMinCount &&
                            n && n.length >= numberMinCount &&
                            sc && sc.length >= specialMinCount;
                    }

                    function customPassword() {
                        var password = "";
                        var randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
                        while (!isStrongEnough(password)) {
                            password = generatePassword(randomLength, false, /[\w\d\?\-]/);
                        }
                        return password;
                    }

                    function makeid()
                    {
                        var text = "";
                        var possible = "0123456789";

                        for( var i=0; i < 5; i++ )
                            text += possible.charAt(Math.floor(Math.random() * possible.length));

                        return text;
                    }

                    request.payload.password = customPassword();
                    console.log("payload.response.xyz: ", request.payload.password);
                    request.payload.coopid = makeid();

                    const conditions = {
                        username: request.payload.username
                    };

                    User.findOne(conditions, (err, user) => {

                        if (err) {
                            return reply(err);
                        }

                        if (user) {
                            return reply(Boom.conflict('Username already in use.'));
                        }

                        reply(true);
                    });
                }
            }, {
                assign: 'emailCheck',
                method: function (request, reply) {

                    const conditions = {
                        email: request.payload.email
                    };

                    User.findOne(conditions, (err, user) => {

                        if (err) {
                            return reply(err);
                        }

                        if (user) {
                            return reply(Boom.conflict('Email already in use.'));
                        }

                        reply(true);
                    });
                }
            }]
        },
        handler: function (request, reply) {

            const mailer = request.server.plugins.mailer;
            //console.log("name: ", request.payload.username)
            Async.auto({
                user: function (done) {

                    const username = request.payload.username;
                    const password = request.payload.password;
                    const email = request.payload.email;
                    const mobile = request.payload.mobile;
                    const town = request.payload.town;
                    const coopid = request.payload.coopid;
                    const avatar = request.payload.avatar;

                    User.create(username, password, email, mobile, town, avatar, done);
                },
                account: ['user', function (results, done) {

                    const name = request.payload.name;

                    Account.create(name, done);
                }],
                linkUser: ['account', function (results, done) {

                    const id = results.account._id.toString();
                    const update = {
                        $set: {
                            user: {
                                id: results.user._id.toString(),
                                name: results.user.username
                            }
                        }
                    };

                    Account.findByIdAndUpdate(id, update, done);
                }],
                linkAccount: ['account', function (results, done) {

                    const id = results.user._id.toString();
                    const update = {
                        $set: {
                            roles: {
                                account: {
                                    id: results.account._id.toString(),
                                    name: results.account.name.first + ' ' + results.account.name.last
                                }
                            }
                        }
                    };

                    User.findByIdAndUpdate(id, update, done);
                }],
                welcome: ['linkUser', 'linkAccount', function (results, done) {

                    const emailOptions = {
                        subject: 'Dein Account bei ' + Config.get('/projectName'),
                        to: {
                            name: request.payload.name,
                            address: request.payload.email,
                            password: request.payload.password,
                            mobile: request.payload.mobile,
                            town: request.payload.town,
                            coopid: request.payload.id
                        }
                    };
                    const template = 'welcome';

                    mailer.sendEmail(emailOptions, template, request.payload, (err) => {

                        if (err) {
                            console.warn('sending welcome email failed:', err.stack);
                        }
                    });

                    done();
                }],
                session: ['linkUser', 'linkAccount', function (results, done) {

                    Session.create(results.user._id.toString(), done);
                }]
            }, (err, results) => {

                if (err) {
                    return reply(err);
                }

                const user = results.linkAccount;
                const credentials = results.session._id + ':' + results.session.key;
                const authHeader = 'Basic ' + new Buffer(credentials).toString('base64');

                const result = {
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        roles: user.roles,
                        mobile: user.mobile,
                        town: user.town,
                        coopid: user.coopid,
                        avatar: user.avatar
                    },
                    session: results.session,
                    authHeader
                };

                reply(result);
            });
        }
    });


    next();
};


exports.register = function (server, options, next) {

    server.dependency(['mailer', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'signup'
};
