'use strict';


exports.register = function (server, options, next) {

    server.views({
        engines: { ejs: require('ejs') },
        relativeTo: __dirname,
        path: '.'
    });

    server.route({
        method: 'GET',
        path: '/coop3000',
        handler: function (request, reply) {

            return reply.view('index');
        }
    });


    next();
};


exports.register.attributes = {
    name: 'coop3000'
};