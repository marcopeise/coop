'use strict';
const AuthPlugin = require('../auth');
const Boom = require('boom');
const Joi = require('joi');


const internals = {};


internals.applyRoutes = function (server, next) {

    const Vote = server.plugins['hapi-mongo-models'].Vote;

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

            const fields = Vote.fieldsAdapter('isActive title endDate votes');

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

                reply(user);
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
