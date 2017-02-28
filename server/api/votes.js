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
        config: {
            auth: {
                strategy: 'session',
                scope: ['user', 'admin', 'account']
            },
            validate: {
                query: {
                    isActive: Joi.string(),
                    sort: Joi.string().default('_id'),
                    limit: Joi.number().default(200),
                    page: Joi.number().default(1)
                }
            }
        },
        handler: function (request, reply) {

            const query = {};
            if (request.query.isActive) {
                query.isActive = request.query.isActive === 'true';
            }
            const fields = request.query.fields;
            const sort = request.query.sort;
            const limit = request.query.limit;
            const page = request.query.page;

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
        config: {
            auth: {
                strategy: 'session',
                scope: ['user', 'admin', 'account']
            }
        },
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

    next();
};


exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'votes'
};
