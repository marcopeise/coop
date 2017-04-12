'use strict';

const internals = {};

internals.applyRoutes = function (server, next) {

    server.views({
        engines: { ejs: require('ejs') },
        relativeTo: __dirname,
        path: '.'
    });

    server.route({
        method: 'GET',
        path: '/brauchen',
        config: {
        },
        handler: function (request, reply) {

            //console.log("request.auth coop3000: ", request.auth);
            return reply.view('index', {
                isLoggedIn: false
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
    name: 'brauchen'
};
