'use strict';
const AuthPlugin = require('../auth');
const Boom = require('boom');
const Joi = require('joi');


const internals = {};


internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;


    server.route({
        method: 'GET',
        path: '/users',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
            validate: {
                query: {
                    username: Joi.string().token().lowercase(),
                    isActive: Joi.string(),
                    role: Joi.string(),
                    fields: Joi.string(),
                    sort: Joi.string().default('_id'),
                    limit: Joi.number().default(200),
                    page: Joi.number().default(1)
                }
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('root')
            ]
        },
        handler: function (request, reply) {

            const query = {};
            if (request.query.username) {
                query.username = new RegExp('^.*?' + request.query.username + '.*$', 'i');
            }
            if (request.query.isActive) {
                query.isActive = request.query.isActive === 'true';
            }
            if (request.query.role) {
                query['roles.' + request.query.role] = { $exists: true };
            }
            const fields = request.query.fields;
            const sort = request.query.sort;
            const limit = request.query.limit;
            const page = request.query.page;

            User.pagedFind(query, fields, sort, limit, page, (err, results) => {

                if (err) {
                    return reply(err);
                }

                reply(results);
            });
        }
    });


    server.route({
        method: 'GET',
        path: '/users/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('root')
            ]
        },
        handler: function (request, reply) {

            User.findById(request.params.id, (err, user) => {

                if (err) {
                    return reply(err);
                }

                if (!user) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply(user);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/coopid/{id}',
        handler: function (request, reply) {

            //console.log("input: ", request.params.id);
            User.findCOOPID(request.params.id, function (err, user) {
                if(err){
                    return reply(err);
                }
                //console.log("get /coopid/id: ", user);
                if(!user){
                    return reply(Boom.notFound('User not found.'));
                }

                reply(user);
            })
        }
    });

    server.route({
        method: 'GET',
        path: '/email/{email}',
        handler: function (request, reply) {

            //console.log("input: ", request.params.email);
            User.findEMAIL(request.params.email, function (err, user) {
                if(err){
                    return reply(err);
                }
                //console.log("get /coopid/: ", user);
                if(!user){
                    return reply(Boom.notFound('User not found.'));
                }

                reply(user);
            })
        }
    });

    server.route({
        method: 'GET',
        path: '/username/{username}',
        handler: function (request, reply) {

            //console.log("input: ", request.params.email);
            User.findByUsername(request.params.username, function (err, user) {
                if(err){
                    return reply(err);
                }
                //console.log("get /coopid/: ", user);
                if(!user){
                    return reply(Boom.notFound('User not found.'));
                }

                reply(user);
            })
        }
    });

    server.route({
        method: 'PUT',
        path: '/connect/{id}',
        handler: function (request, reply) {

            console.log("input useroneid: ", request.payload.useroneid);
            console.log("input useroneusername: ", request.payload.useroneusername);
            console.log("input usertwoid: ", request.params.id);

            const id = request.params.id;

            User.findByIdAndUpdate(
                id,
                {
                    $addToSet: {
                        connections: {
                            user: {
                                id:     request.payload.useroneid,
                                name:   request.payload.useroneusername
                            }
                        }
                    }
                }, function(err) {
                    if(err){
                        return reply(err);
                    }
                    reply(true);
                }
            );
        }
    });

    server.route({
        method: 'GET',
        path: '/users/my',
        config: {
            auth: {
                strategy: 'session',
                scope: ['admin', 'account']
            }
        },
        handler: function (request, reply) {

            const id = request.auth.credentials.user._id.toString();
            const fields = User.fieldsAdapter('username email roles isActive mobile town coopid connections follows followsHistory followedBy followedByHistory verknExtended altersvorsorge sozialakademie knappenbar gemuesefond gluecklichtage paybackpele walzer diskofox chachacha wienerwalzer swing rumba foxtrott blues token expires timeCreated');

            User.findById(id, fields, (err, user) => {

                if (err) {
                    return reply(err);
                }

                if (!user) {
                    return reply(Boom.notFound('Document not found. That is strange.'));
                }

                reply(user);
            });
        }
    });


    server.route({
        method: 'POST',
        path: '/users',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
            validate: {
                payload: {
                    username: Joi.string().token().lowercase().required(),
                    password: Joi.string().required(),
                    email: Joi.string().email().lowercase().required()
                }
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('root'),
                {
                    assign: 'usernameCheck',
                    method: function (request, reply) {

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
                }
            ]
        },
        handler: function (request, reply) {

            const username = request.payload.username;
            const password = request.payload.password;
            const email = request.payload.email;

            User.create(username, password, email, (err, user) => {

                if (err) {
                    return reply(err);
                }

                reply(user);
            });
        }
    });


    server.route({
        method: 'PUT',
        path: '/users/{id}',
        config: {
            validate: {
                params: {
                    id: Joi.string().invalid('000000000000000000000000')
                }
            },
            pre: [
                {
                    assign: 'usernameCheck',
                    method: function (request, reply) {

                        const conditions = {
                            username: request.payload.username,
                            _id: { $ne: User._idClass(request.params.id) }
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
                            email: request.payload.email,
                            _id: { $ne: User._idClass(request.params.id) }
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
                }
            ]
        },
        handler: function (request, reply) {

            const id = request.params.id;
            const update = {
                $set: {
                    isActive:   request.payload.isActive,
                    username:   request.payload.username,
                    email:      request.payload.email,
                    mobile:     request.payload.mobile,
                    town:       request.payload.town,
                    coopid:     request.payload.coopid,
                    verknExtended: request.payload.verknExtended,
                    altersvorsorge: request.payload.altersvorsorge,
                    sozialakademie: request.payload.sozialakademie,
                    knappenbar: request.payload.knappenbar,
                    gemuesefond: request.payload.gemuesefond,
                    gluecklichtage: request.payload.gluecklichtage,
                    paybackpele: request.payload.paybackpele,
                    walzer: request.payload.walzer,
                    diskofox: request.payload.diskofox,
                    chachacha: request.payload.chachacha,
                    wienerwalzer: request.payload.wienerwalzer,
                    swing: request.payload.swing,
                    rumba: request.payload.rumba,
                    foxtrott: request.payload.foxtrott,
                    blues: request.payload.blues
                }
            };

            User.findByIdAndUpdate(id, update, (err, user) => {

                if (err) {
                    return reply(err);
                }

                if (!user) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply(user);
            });

        }
    });


    server.route({
        method: 'PUT',
        path: '/users/my',
        config: {
            auth: {
                strategy: 'session',
                scope: ['admin', 'account']
            },
            validate: {
                payload: {
                    username: Joi.string().token().lowercase().required(),
                    email: Joi.string().email().lowercase().required()
                }
            },
            pre: [
                AuthPlugin.preware.ensureNotRoot,
                {
                    assign: 'usernameCheck',
                    method: function (request, reply) {

                        const conditions = {
                            username: request.payload.username,
                            _id: { $ne: request.auth.credentials.user._id }
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
                            email: request.payload.email,
                            _id: { $ne: request.auth.credentials.user._id }
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
                }
            ]
        },
        handler: function (request, reply) {

            const id = request.auth.credentials.user._id.toString();
            const update = {
                $set: {
                    username: request.payload.username,
                    email: request.payload.email
                }
            };
            const findOptions = {
                fields: User.fieldsAdapter('username email roles')
            };

            User.findByIdAndUpdate(id, update, findOptions, (err, user) => {

                if (err) {
                    return reply(err);
                }

                reply(user);
            });
        }
    });


    server.route({
        method: 'PUT',
        path: '/users/{id}/password',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
            validate: {
                params: {
                    id: Joi.string().invalid('000000000000000000000000')
                },
                payload: {
                    password: Joi.string().required()
                }
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('root'),
                {
                    assign: 'password',
                    method: function (request, reply) {

                        User.generatePasswordHash(request.payload.password, (err, hash) => {

                            if (err) {
                                return reply(err);
                            }

                            reply(hash);
                        });
                    }
                }
            ]
        },
        handler: function (request, reply) {

            const id = request.params.id;
            const update = {
                $set: {
                    password: request.pre.password.hash
                }
            };

            User.findByIdAndUpdate(id, update, (err, user) => {

                if (err) {
                    return reply(err);
                }

                reply(user);
            });
        }
    });


    server.route({
        method: 'PUT',
        path: '/users/my/password',
        config: {
            auth: {
                strategy: 'session',
                scope: ['admin', 'account']
            },
            validate: {
                payload: {
                    password: Joi.string().required()
                }
            },
            pre: [
                AuthPlugin.preware.ensureNotRoot,
                {
                    assign: 'password',
                    method: function (request, reply) {

                        User.generatePasswordHash(request.payload.password, (err, hash) => {

                            if (err) {
                                return reply(err);
                            }

                            reply(hash);
                        });
                    }
                }
            ]
        },
        handler: function (request, reply) {

            const id = request.auth.credentials.user._id.toString();
            const update = {
                $set: {
                    password: request.pre.password.hash
                }
            };
            const findOptions = {
                fields: User.fieldsAdapter('username email')
            };

            User.findByIdAndUpdate(id, update, findOptions, (err, user) => {

                if (err) {
                    return reply(err);
                }

                reply(user);
            });
        }
    });


    server.route({
        method: 'DELETE',
        path: '/users/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
            validate: {
                params: {
                    id: Joi.string().invalid('000000000000000000000000')
                }
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('root')
            ]
        },
        handler: function (request, reply) {

            User.findByIdAndDelete(request.params.id, (err, user) => {

                if (err) {
                    return reply(err);
                }

                if (!user) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply({ message: 'Success.' });
            });
        }
    });

    server.route({
        method: 'PUT',
        path: '/follow',
        handler: function (request, reply) {

            console.log('wants to follow: ', request.payload.followsUser);
            console.log('user requesting: ', request.payload.isUser);

            const isUserfields =        User.fieldsAdapter('username followedBy');
            const followUserfields =    User.fieldsAdapter('username');

            User.findById(request.payload.isUser, isUserfields, (err, isUser) => {

                if (err) {
                    return reply(err);
                }

                if (!isUser) {
                    return reply(Boom.notFound('Document not found. That is strange.'));
                }
                console.log("isUser FOUND: ", isUser);

                //if isUser has Followers -> Number of Followers will be added to votecount
                var votecount = 1;
                if(isUser.followedBy != undefined && isUser.followedBy.length>0){
                    votecount = votecount + isUser.followedBy.length;
                    console.log("votecount: ", votecount);
                }
                console.log("votecount: ", votecount);

                User.findById(request.payload.followsUser, followUserfields, (err, followUser) => {

                    if (err) {
                        return reply(err);
                    }

                    if (!isUser){
                        return reply(Boom.notFound('Document not found. That is strange.'));
                    }
                    console.log("followUser FOUND: ", followUser);

                    User.findByIdAndUpdate(
                        request.payload.followsUser,
                        {
                            $addToSet: {
                                followedBy: {
                                    id: isUser._id,
                                    name: isUser.username,
                                    votecount: votecount,
                                    periodStart: new Date()
                                }
                            }
                        }, function (err) {
                            if (err) {
                                console.log("ERROR update followsUser: ", err);
                                return reply(err);
                            }
                            User.findByIdAndUpdate(
                                request.payload.isUser,
                                {
                                    $addToSet: {
                                        follows: {
                                            id: followUser._id,
                                            name: followUser.username,
                                            periodStart: new Date()
                                        }
                                    }
                                }, function (err) {
                                    if (err) {
                                        console.log("ERROR update isUser: ", err);
                                        return reply(err);
                                    }
                                    reply(true);
                                }
                            );
                        }
                    );
                });
            });
        }
    });

    server.route({
        method: 'DELETE',
        path: '/unfollow',
        handler: function (request, reply) {

            console.log('wants to unfollow: ', request.payload.followsUser);
            console.log('user requesting: ', request.payload.isUser);
            var ObjectId = require('mongodb').ObjectID;

            const followsUser = ObjectId(request.payload.followsUser);
            const requestingUser = ObjectId(request.payload.isUser);

            var update;
            update = {
                $pull: {
                    followedBy: {
                        id:         requestingUser
                    }
                }
            };

            User.findByIdAndUpdate(request.payload.followsUser, update, (err, userfollowed) => {

                if (err) {
                    return reply(err);
                }

                if (!userfollowed) {
                    return reply(Boom.notFound('Document not found.'));
                }

                console.log("userfollowed AFTER: ", userfollowed);

                //TODO: if followedUser also follows someone, one has to substract one votecount
                /*if(userfollowed.follows != undefined && userfollowed.follows.length>0){

                }*/

                var update;
                update = {
                    $pull: {
                        follows: {
                            id:         followsUser
                        }
                    }
                };

                User.findByIdAndUpdate(request.payload.isUser, update, (err, freeuser) => {

                    if (err) {
                        return reply(err);
                    }

                    if (!freeuser) {
                        return reply(Boom.notFound('Document not found.'));
                    }

                    reply(freeuser);
                });
            });
        }
    });

    next();
};


exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'users'
};
