'use strict';
const AuthPlugin = require('../auth');
const Boom = require('boom');
const Joi = require('joi');


const internals = {};


internals.applyRoutes = function (server, next) {

    const Event = server.plugins['hapi-mongo-models'].Event;
    const User = server.plugins['hapi-mongo-models'].User;

    server.route({
        method: 'GET',
        path: '/events',
        handler: function (request, reply) {

            const query = {};
            const sort = request.query.sort;
            const limit = request.query.limit;
            const page = request.query.page;

            const fields = Event.fieldsAdapter('name participants timeCreated timeChanged');

            Event.pagedFind(query, fields, sort, limit, page, (err, results) => {

                if (err) {
                    return reply(err);
                }

                reply(results);
            });
        }
    });


    server.route({
        method: 'GET',
        path: '/event/{id}',
        handler: function (request, reply) {

            Event.findById(request.params.id, (err, event) => {

                if (err) {
                    return reply(err);
                }

                if (!event) {
                    return reply(Boom.notFound('Event not found.'));
                }

                reply(event);
            });
        }
    });

    /*server.route({
        method: 'PUT',
        path: '/addevent',
        handler: function (request, reply) {

            console.log('adding event: ', request.payload.eventname);

            User.updateMany(
                {}, // filter, Specify an empty document { } to update all documents in the collection.
                {
                    $addToSet: {
                        events: {
                            name: request.payload.eventname,
                            participate: false
                        }
                    }
                }, function (err) {
                    if (err) {
                        console.log("ERROR update addevent: ", err);
                        return reply(err);
                    }
                    reply(true);
                }
            );
        }
    });

    server.route({
        method: 'PUT',
        path: '/editevent',
        handler: function (request, reply) {

            console.log('edit event old: ', request.payload.eventnameold);
            console.log('edit event new: ', request.payload.eventnamenew);

            User.updateMany(
                {events: { $elemMatch: { name: request.payload.eventnameold}}}, // filter, Specify an empty document { } to update all documents in the collection.
                {
                    $set: {
                        "events.$.name": request.payload.eventnamenew
                    }
                }, function (err) {
                    if (err) {
                        console.log("ERROR update addevent: ", err);
                        return reply(err);
                    }
                    reply(true);
                }
            );
        }
    });*/

    server.route({
        method: 'POST',
        path: '/event',
        config: {
            validate: {
                payload: {
                    eventname: Joi.string().required()
                }
            }
        },
        handler: function (request, reply) {

            console.log("POST /event ", request.payload);

            const name = request.payload.eventname;

            Event.create(name, (err, event) => {

                if (err) {
                    return reply(err);
                }

                reply(event);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/participateevent/{id}',
        config: {
            validate: {
                params: {
                    id:         Joi.string().required()
                }
            }
        },
        handler: function (request, reply) {

            console.log("POST /participateevent ", request.payload);

            const id = request.params.id;
            var update;
            update = {
                $addToSet: {
                    participants: {
                        id:     request.payload.participantId,
                        name:   request.payload.participantUsername
                    }
                }
            }

            Event.findByIdAndUpdate(id, update, (err, event) => {

                if (err) {
                    return reply(err);
                }

                if (!event) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply(event);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/notparticipateevent/{id}',
        config: {
            validate: {
                params: {
                    id:         Joi.string().required()
                }
            }
        },
        handler: function (request, reply) {

            console.log("POST /notparticipateevent ", request.payload);

            const id = request.params.id;
            var update;
            update = {
                $pull: {
                    participants: {
                        id:         request.payload.participantId
                    }
                }
            };

            Event.findByIdAndUpdate(id, update, (err, event) => {

                if (err) {
                    return reply(err);
                }

                if (!event) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply(event);
            });
        }
    });

    server.route({
        method: 'DELETE',
        path: '/deleteevent/{id}',
        config: {
            validate: {
                params: {
                    id:             Joi.string().required()
                }
            }
        },
        handler: function (request, reply) {

            console.log("DELETE /deleteevent ", request.payload);

            Event.findByIdAndDelete(request.params.id, (err, event) => {

                if (err) {
                    return reply(err);
                }

                if (!event) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply({ message: 'Success.' });
            })
        }
    });

    server.route({
        method: 'PUT',
        path: '/event/{id}',
        config: {
            validate: {
                params: {
                    id:             Joi.string().required()
                },
                payload: {
                    eventnamenew:    Joi.string().required()
                }
            }
        },
        handler: function (request, reply) {
            //console.log("PUT /event payload: ", request.payload);

            const id = request.params.id;
            const update = {
                $set: {
                    name:          request.payload.eventnamenew,
                    timeChanged:    new Date()
                }
            };

            Event.findByIdAndUpdate(id, update, (err, event) => {

                if (err) {
                    return reply(err);
                }

                if (!event) {
                return reply(Boom.notFound('Document not found.'));
            }

            reply(event);
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
    name: 'events'
};
