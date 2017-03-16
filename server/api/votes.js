'use strict';
const AuthPlugin = require('../auth');
const Boom = require('boom');
const Joi = require('joi');


const internals = {};


internals.applyRoutes = function (server, next) {

    const Vote = server.plugins['hapi-mongo-models'].Vote;
    const User = server.plugins['hapi-mongo-models'].User;

    server.route({
        method: 'GET',
        path: '/votes',
        handler: function (request, reply) {

            const query = {};
            /*if (request.query.isActive) {
                query.isActive = request.query.isActive === 'true';
            }*/
            const sort = request.query.sort;
            const limit = request.query.limit;
            const page = request.query.page;

            const fields = Vote.fieldsAdapter('isActive title endDate votes votespos votesneg comments content ownerId');

            Vote.pagedFind(query, fields, sort, limit, page, (err, results) => {

                if (err) {
                    return reply(err);
                }

                reply(results);
            });
        }
    });


    server.route({
        method: 'GET',
        path: '/votes/{id}',
        handler: function (request, reply) {

            Vote.findById(request.params.id, (err, vote) => {

                if (err) {
                    return reply(err);
                }

                if (!vote) {
                    return reply(Boom.notFound('Vote not found.'));
                }

                reply(vote);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/votes',
        config: {
            validate: {
                payload: {
                    title: Joi.string().required(),
                    content: Joi.string().required(),
                    enddate: Joi.date().required(),
                    ownerId: Joi.string().required(),
                    ownerUsername: Joi.string().required()
                }
            }
        },
        handler: function (request, reply) {

            console.log("POST /votes ", request.payload);

            const title = request.payload.title;
            const content = request.payload.content;
            const enddate = request.payload.enddate;
            const ownerId = request.payload.ownerId;
            const ownerUsername = request.payload.ownerUsername;

            Vote.create(title, ownerId, ownerUsername, content, enddate, (err, vote) => {

                if (err) {
                    return reply(err);
                }

                reply(vote);
        });
        }
    });

    server.route({
        method: 'POST',
        path: '/voting/{id}',
        config: {
            validate: {
                params: {
                    id:         Joi.string().required()
                }
            }
        },
        handler: function (request, reply) {

            console.log("POST /voting ", request.payload);

            // get all attached users
            const isUserfields =        User.fieldsAdapter('username followedBy follows');

            User.findById(request.payload.ownerId, isUserfields, (err, votingUser) => {

                if (err) {
                    return reply(err);
                }

                if (!votingUser){
                    return reply(Boom.notFound('Document not found. That is strange.'));
                }
                console.log("voting User FOUND: ", votingUser);

                //check if user is currenly following somebody -> not allowed
                if(votingUser.follows != undefined && votingUser.follows.length>0){
                    return reply("Sorry, wenn Du aktuell mit einem anderen Teilnehmer via Saugnapf verbunden bist, kannst du nicht mit abstimmen.");
                }

                const id = request.params.id;
                var update;

                if(request.payload.decision=='plus'){
                    console.log("Vote in Favor: ", request.payload.decision);
                    update = {
                        $addToSet: {
                            votespos: {
                                id:     request.payload.ownerId,
                                name:   request.payload.ownerUsername
                            }
                        }
                    };
                }else{
                    console.log("Vote Oppose: ", request.payload.decision);
                    update = {
                        $addToSet: {
                            votesneg: {
                                id:     request.payload.ownerId,
                                name:   request.payload.ownerUsername
                            }
                        }
                    };
                }

                Vote.findByIdAndUpdate(id, update, (err, user) => {

                    if (err) {
                        return reply(err);
                    }

                    if (!user) {
                        return reply(Boom.notFound('Document not found.'));
                    }

                    //check if user has followers -> must be added too when voting to the vote
                    if(votingUser.followedBy != undefined && votingUser.followedBy.length>0){
                        console.log("user has followers - voting: ", votingUser.followedBy);
                        for (var i = 0; i < votingUser.followedBy.length; i++) {
                            var followedBy = votingUser.followedBy[i];
                            console.log("votingUser in Loop: ", followedBy);
                            for (var j = 0; j < followedBy.votecount; j++) {
                                var updateByFollowed;
                                if (request.payload.decision == 'plus') {
                                    console.log("Vote in Favor by followed: ", followedBy.name);
                                    updateByFollowed = {
                                        $push: {
                                            votespos: {
                                                id: followedBy.id,
                                                name: followedBy.name
                                            }
                                        }
                                    };
                                } else {
                                    console.log("Vote Oppose by followed: ", followedBy.name);
                                    updateByFollowed = {
                                        $push: {
                                            votesneg: {
                                                id: followedBy.id,
                                                name: followedBy.name
                                            }
                                        }
                                    };
                                }

                                Vote.findByIdAndUpdate(id, updateByFollowed, (err, user) => {

                                    if (err) {
                                        return reply(err);
                                    }

                                    if (!user) {
                                        return reply(Boom.notFound('Document not found.'));
                                    }
                                });
                            }
                        }
                        console.log("user with followers - voting done");
                        reply(user);
                    }else{
                        console.log("user has no followers - voting done");
                        reply(user);
                    }

                });
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/commentvoting/{id}',
        config: {
            validate: {
                params: {
                    id:         Joi.string().required()
                }
            }
        },
        handler: function (request, reply) {

            console.log("POST /commentvoting ", request.payload);

            const id = request.params.id;
            var update;
            update = {
                $push: {
                    comments: {
                        comment:    request.payload.comment,
                        id:         request.payload.commentOwnerId,
                        name:       request.payload.commentOwnerUsername,
                        timeCreated:new Date()
                    }
                }
            };

            Vote.findByIdAndUpdate(id, update, (err, user) => {

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
        method: 'DELETE',
        path: '/deletevote/{id}',
        config: {
            validate: {
                params: {
                    id:             Joi.string().required()
                },
                payload: {
                    voteOwnerId:    Joi.string().required(),
                    currentUserId:  Joi.string().required()
                }
            }
        },
        handler: function (request, reply) {

            console.log("POST /deletevote ", request.payload);
            const fields = User.fieldsAdapter('roles');

            User.findById(request.payload.currentUserId, fields, (err, user) => {

                if (err) {
                    return reply(err);
                }

                if (!user) {
                    return reply(Boom.notFound('Document not found. That is strange.'));
                }

                //console.log("user: ", user);
                var currentUser = user;
                console.log("currentUser: ", currentUser);

                // check if user is admin
                var userCanDelete = false;
                if(currentUser.roles.admin != undefined){
                    userCanDelete = true;
                }

                // check if user is ownerOfVote
                if(request.payload.currentUserId == request.payload.voteOwnerId ){
                    userCanDelete = true;
                }

                if(userCanDelete){
                    Vote.findByIdAndDelete(request.params.id, (err, vote) => {

                        if (err) {
                            return reply(err);
                        }

                        if (!vote) {
                            return reply(Boom.notFound('Document not found.'));
                        }

                        reply({ message: 'Success.' });
                    })
                }else{
                    return reply(Boom.conflict('User is not authorized to delete this vote.'));
                }
            });
        }
    });

    server.route({
        method: 'PUT',
        path: '/editvote/{id}',
        config: {
            validate: {
                params: {
                    id:             Joi.string().required()
                },
                payload: {
                    voteOwnerId:    Joi.string().required(),
                    currentUserId:  Joi.string().required(),
                    voteTitle:      Joi.string(),
                    voteContent:    Joi.string(),
                    voteEndDate:    Joi.date()
                }
            }
        },
        handler: function (request, reply) {
            //console.log("PUT /editvote payload: ", request.payload);

            const id = request.params.id;
            const update = {
                $set: {
                    title:          request.payload.voteTitle,
                    content:        request.payload.voteContent,
                    endDate:        request.payload.voteEndDate,
                    timeChanged:    new Date()
                }
            };

            Vote.findByIdAndUpdate(id, update, (err, vote) => {

                if (err) {
                    return reply(err);
                }

                if (!vote) {
                return reply(Boom.notFound('Document not found.'));
            }

            reply(vote);
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
    name: 'votes'
};
